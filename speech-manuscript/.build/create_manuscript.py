from __future__ import annotations

import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


INPUT_PPTX = Path('/Users/gaozhenchao/Code/AS_CSC++/speaker-script/output/Final_Presentation.pptx')
OUTPUT_DOCX = Path('/Users/gaozhenchao/Code/AS_CSC++/speech-manuscript/output/Java_Python_Speech_Manuscript.docx')

SLIDE_TITLES = [
    'How Java and Python Run',
    'Both Use Bytecode With Different Compatibility Rules',
    'Java Exposes a Portable Class File Before Execution',
    'A Direct Run Command Still Includes Compilation',
    'Moving a Program Requires a Compatible Environment',
    'Python Can Hand a Function Call to Compiled C++',
    'Performance Depends on the Work and Execution Path',
    'The Right Choice Follows the Application Requirements',
    'The Key Difference Is Where Execution Complexity Sits',
    'Sources and Technical Scope',
]

REFERENCES = [
    ('Oracle Java Tutorial About the Java Technology', 'https://docs.oracle.com/javase/tutorial/getStarted/intro/definition.html'),
    ('Java Virtual Machine Specification SE 25 Chapter 2', 'https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html'),
    ('Java SE 25 java Command and Source File Mode', 'https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html'),
    ('Python General FAQ', 'https://docs.python.org/3/faq/general.html'),
    ('Python dis Documentation for CPython Bytecode', 'https://docs.python.org/3/library/dis.html'),
    ('Python Modules Tutorial and Bytecode Caching', 'https://docs.python.org/3/tutorial/modules.html'),
    ('Extending and Embedding the Python Interpreter', 'https://docs.python.org/3/extending/extending.html'),
    ('pybind11 First Steps', 'https://pybind11.readthedocs.io/en/stable/basics.html'),
    ('Java Native Interface Introduction', 'https://docs.oracle.com/en/java/javase/25/docs/specs/jni/intro.html'),
]


def normalize_text(text: str) -> str:
    replacements = {
        '\u2018': "'",
        '\u2019': "'",
        '\u201c': '"',
        '\u201d': '"',
        '\u2013': '-',
        '\u2014': ' - ',
        '\u2026': '...',
        '\u00a0': ' ',
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return re.sub(r'[ \t]+\n', '\n', text).strip()


def extract_note_text(pptx_path: Path, slide_number: int) -> str:
    member = f'ppt/notesSlides/notesSlide{slide_number}.xml'
    with zipfile.ZipFile(pptx_path) as archive:
        root = ET.fromstring(archive.read(member))
    namespace = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
    chunks = [node.text or '' for node in root.findall('.//a:t', namespace)]
    return normalize_text('\n'.join(chunks))


def parse_note(raw: str) -> tuple[str, str]:
    if not raw.startswith('SCRIPT'):
        raise ValueError('Speaker note does not begin with SCRIPT')
    body = raw[len('SCRIPT'):].strip()
    body = body.split('REFERENCE NOTES', 1)[0].strip()
    if 'TRANSITION' in body:
        script, transition = body.split('TRANSITION', 1)
        return script.strip(), transition.strip()
    return body.strip(), ''


def set_run_font(run, name: str, size: float, bold: bool | None = None, italic: bool | None = None, color: str = '000000') -> None:
    run.font.name = name
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:ascii'), name)
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:hAnsi'), name)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def style_paragraph(paragraph, *, line_spacing: float = 1.16, after: float = 6, before: float = 0) -> None:
    fmt = paragraph.paragraph_format
    fmt.line_spacing = line_spacing
    fmt.space_after = Pt(after)
    fmt.space_before = Pt(before)
    fmt.widow_control = True


def add_page_number(paragraph) -> None:
    run = paragraph.add_run('Page ')
    set_run_font(run, 'Arial', 9, color='666666')
    field_begin = OxmlElement('w:fldChar')
    field_begin.set(qn('w:fldCharType'), 'begin')
    instruction = OxmlElement('w:instrText')
    instruction.set(qn('xml:space'), 'preserve')
    instruction.text = ' PAGE '
    field_end = OxmlElement('w:fldChar')
    field_end.set(qn('w:fldCharType'), 'end')
    run._r.append(field_begin)
    run._r.append(instruction)
    run._r.append(field_end)


def add_hyperlink(paragraph, url: str, label: str) -> None:
    relationship_id = paragraph.part.relate_to(
        url,
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
        is_external=True,
    )
    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), relationship_id)
    run = OxmlElement('w:r')
    properties = OxmlElement('w:rPr')
    color = OxmlElement('w:color')
    color.set(qn('w:val'), '365F73')
    underline = OxmlElement('w:u')
    underline.set(qn('w:val'), 'single')
    properties.append(color)
    properties.append(underline)
    run.append(properties)
    text = OxmlElement('w:t')
    text.text = label
    run.append(text)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def remove_paragraph_borders(paragraph) -> None:
    properties = paragraph._p.get_or_add_pPr()
    borders = properties.find(qn('w:pBdr'))
    if borders is not None:
        properties.remove(borders)


def remove_style_borders(style) -> None:
    properties = style._element.get_or_add_pPr()
    borders = properties.find(qn('w:pBdr'))
    if borders is not None:
        properties.remove(borders)


def build_document() -> None:
    notes = [parse_note(extract_note_text(INPUT_PPTX, number)) for number in range(1, 11)]

    document = Document()
    document.core_properties.title = 'How Java and Python Run Speech Manuscript'
    document.core_properties.subject = 'Speaker manuscript for a ten slide school presentation'
    document.core_properties.author = ''

    section = document.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.72)
    section.bottom_margin = Inches(0.72)
    section.left_margin = Inches(0.85)
    section.right_margin = Inches(0.85)

    styles = document.styles
    normal = styles['Normal']
    normal.font.name = 'Arial'
    normal._element.rPr.rFonts.set(qn('w:ascii'), 'Arial')
    normal._element.rPr.rFonts.set(qn('w:hAnsi'), 'Arial')
    normal.font.size = Pt(11.5)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.line_spacing = 1.16
    normal.paragraph_format.space_after = Pt(6)

    title_style = styles['Title']
    title_style.font.name = 'Arial'
    title_style._element.rPr.rFonts.set(qn('w:ascii'), 'Arial')
    title_style._element.rPr.rFonts.set(qn('w:hAnsi'), 'Arial')
    title_style.font.size = Pt(23.5)
    title_style.font.bold = True
    title_style.font.color.rgb = RGBColor(0, 0, 0)
    title_style.paragraph_format.space_after = Pt(6)
    remove_style_borders(title_style)

    heading = styles['Heading 1']
    heading.font.name = 'Arial'
    heading._element.rPr.rFonts.set(qn('w:ascii'), 'Arial')
    heading._element.rPr.rFonts.set(qn('w:hAnsi'), 'Arial')
    heading.font.size = Pt(15.5)
    heading.font.bold = True
    heading.font.color.rgb = RGBColor(0, 0, 0)
    heading.paragraph_format.space_before = Pt(14)
    heading.paragraph_format.space_after = Pt(6)
    heading.paragraph_format.keep_with_next = True

    if 'Document Subtitle' not in [style.name for style in styles]:
        subtitle_style = styles.add_style('Document Subtitle', WD_STYLE_TYPE.PARAGRAPH)
    else:
        subtitle_style = styles['Document Subtitle']
    subtitle_style.font.name = 'Arial'
    subtitle_style._element.rPr.rFonts.set(qn('w:ascii'), 'Arial')
    subtitle_style._element.rPr.rFonts.set(qn('w:hAnsi'), 'Arial')
    subtitle_style.font.size = Pt(12)
    subtitle_style.font.color.rgb = RGBColor(0, 0, 0)
    subtitle_style.paragraph_format.space_after = Pt(12)

    title = document.add_paragraph(style='Title')
    title.add_run('How Java and Python Run Speech Manuscript')
    remove_paragraph_borders(title)

    subtitle = document.add_paragraph(style='Document Subtitle')
    subtitle.add_run('Complete speaker script for the ten slide school presentation')

    overview = document.add_paragraph()
    overview.add_run(
        'This manuscript follows the presentation slide by slide. Speaker directions appear in brackets, '
        'and each transition is separated from the main script. At a clear speaking pace, the complete '
        'presentation should take approximately nine to eleven minutes.'
    )
    style_paragraph(overview, after=10)

    for index, ((script, transition), slide_title) in enumerate(zip(notes, SLIDE_TITLES), start=1):
        if index in {3, 5, 7, 9}:
            document.add_page_break()
        heading_paragraph = document.add_paragraph(style='Heading 1')
        heading_paragraph.add_run(f'Slide {index}  {slide_title}')

        for block in [part.strip() for part in script.split('\n\n') if part.strip()]:
            paragraph = document.add_paragraph()
            style_paragraph(paragraph)
            if block.startswith('[') and ']' in block:
                cue, rest = block.split(']', 1)
                cue_run = paragraph.add_run(cue + ']')
                set_run_font(cue_run, 'Arial', 11.5, bold=True, italic=True, color='333333')
                rest_run = paragraph.add_run(rest)
                set_run_font(rest_run, 'Arial', 11.5)
            else:
                run = paragraph.add_run(block)
                set_run_font(run, 'Arial', 11.5)

        if transition:
            paragraph = document.add_paragraph()
            style_paragraph(paragraph, before=2, after=8)
            paragraph.paragraph_format.left_indent = Inches(0.22)
            paragraph.paragraph_format.keep_together = True
            label = paragraph.add_run('Transition  ')
            set_run_font(label, 'Arial', 10.5, bold=True, color='333333')
            transition_run = paragraph.add_run(transition)
            set_run_font(transition_run, 'Arial', 10.5, italic=True, color='4D4D4D')

    document.add_page_break()
    references_heading = document.add_paragraph(style='Heading 1')
    references_heading.add_run('Reference Sources')
    reference_intro = document.add_paragraph()
    reference_intro.add_run(
        'These official and primary sources support the technical claims. They are provided for '
        'verification and should not be read aloud during the presentation.'
    )
    style_paragraph(reference_intro, after=10)

    for index, (label, url) in enumerate(REFERENCES, start=1):
        paragraph = document.add_paragraph()
        style_paragraph(paragraph, after=5)
        number = paragraph.add_run(f'{index}. ')
        set_run_font(number, 'Arial', 10.5, bold=True)
        add_hyperlink(paragraph, url, label)
        url_paragraph = document.add_paragraph()
        style_paragraph(url_paragraph, line_spacing=1.0, after=6)
        url_paragraph.paragraph_format.left_indent = Inches(0.28)
        url_run = url_paragraph.add_run(url)
        set_run_font(url_run, 'Arial', 8.5, color='666666')

    footer = section.footer
    footer_paragraph = footer.paragraphs[0]
    footer_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    add_page_number(footer_paragraph)

    OUTPUT_DOCX.parent.mkdir(parents=True, exist_ok=True)
    document.save(OUTPUT_DOCX)
    print(OUTPUT_DOCX)


if __name__ == '__main__':
    build_document()
