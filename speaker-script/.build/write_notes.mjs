import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const input = '/Users/gaozhenchao/Code/AS_CSC++/Final_Presentation_source.pptx';
const outputDir = '/Users/gaozhenchao/Code/AS_CSC++/speaker-script/output';
const output = path.join(outputDir, 'Final_Presentation_with_Speaker_Notes.pptx');

const scripts = [
`SCRIPT
Good morning, everyone. Let me begin with a simple question: when we click “Run,” what actually happens between the code on the screen and the instructions executed by the computer?

Today I will compare Java and Python by following that journey. I will focus on three questions: how each language turns source code into executable work, what “portable” really means, and why both ecosystems sometimes rely on native C or C++ code. For precision, whenever I say “Python” in the execution diagrams, I mean CPython—the standard implementation most people use.

By the end, I hope the comparison feels less like “compiled versus interpreted” and more like two different ways of organizing the same basic problem.

TRANSITION
First, we need to correct the most common oversimplification.

REFERENCE NOTES
Cover artwork is an AI-generated conceptual illustration, not a photograph of a real processor.
https://docs.oracle.com/javase/tutorial/getStarted/intro/definition.html
https://docs.python.org/3/faq/general.html
https://docs.python.org/3/library/dis.html`,

`SCRIPT
The key distinction is not that Java has bytecode while Python does not. Both Java and CPython use bytecode—an intermediate instruction set created from source code.

[Point to the upper path.] In Java, the class file is a standardized execution and distribution artifact. The compiler produces it, and a compatible Java Virtual Machine is designed to load and execute it.

[Point to the lower path.] CPython also compiles source into bytecode, but that bytecode is mainly an internal representation for the CPython runtime. Its instruction set can change between Python releases, so it is not the same kind of cross-runtime contract as a Java class file.

That is why “Java is compiled and Python is interpreted” is incomplete. The more useful question is: compiled into what, and for which runtime?

TRANSITION
Let us follow the Java path step by step.

REFERENCE NOTES
https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html
https://docs.python.org/3/library/dis.html`,

`SCRIPT
In the conventional Java workflow, the source file ends in dot java. We pass it to javac, the Java compiler, which produces a dot class file containing JVM bytecode.

When we launch the application, the JVM loads the class, checks and links the required structures, and begins execution. In Oracle’s HotSpot implementation, frequently executed—or “hot”—code can be compiled into native machine instructions while the program is running. That is just-in-time compilation, or JIT.

This model makes the stages visible: source code, compiler, class file, and runtime. Modern Java also supports source-file launch modes, so a beginner may sometimes use one command. But the underlying distinction between source, class-file representation, and the JVM remains important.

Portability therefore does not mean “runs everywhere automatically.” It means the target environment must provide a compatible JVM, APIs, and libraries.

TRANSITION
Python hides more of these stages from the everyday workflow, but they are still there.

REFERENCE NOTES
https://docs.oracle.com/javase/tutorial/getStarted/intro/definition.html
https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html
https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html`,

`SCRIPT
Python feels more direct: we write a dot py file and run it. However, CPython does not simply read each source line and execute it as written. It first compiles the source into CPython bytecode, and then the interpreter executes those bytecode instructions.

[Point to the three boxes.] So the conceptual path is still source, compilation, and execution—the intermediate step is just managed internally.

When imported modules are used again, CPython may store cached bytecode in the __pycache__ folder as dot pyc files. The purpose is mainly to avoid repeating some loading and compilation work. It does not make the program’s calculations inherently faster after the module is loaded. A main script launched directly also normally does not receive that same persistent cache treatment.

The result is a convenient source-first workflow, but the runtime still has a precise execution model underneath it.

TRANSITION
Now we can compare what each system actually makes portable.

REFERENCE NOTES
https://docs.python.org/3/library/dis.html
https://docs.python.org/3/tutorial/modules.html`,

`SCRIPT
This table separates three artifacts that are often mixed together: source code, intermediate code, and native components.

Java source can move between systems, but it must be compiled with the required language level and libraries. Java class files have a standardized JVM format, yet the destination still needs a compatible JVM and the APIs the application expects.

Python source is also portable when the destination has a compatible interpreter and the required packages. CPython bytecode is less suitable as a distribution promise because it is tied more closely to CPython and its version.

The third row is the important limit on both stories. Once an application uses native libraries, portability also depends on the operating system, processor architecture, binary format, and interface compatibility.

So “portable” is never a property of one file alone. It is a relationship between the artifact and the environment that must run it.

TRANSITION
That becomes concrete when Python calls a C++ function.

REFERENCE NOTES
https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html
https://docs.python.org/3/faq/general.html
https://docs.python.org/3/library/dis.html
https://docs.python.org/3/extending/extending.html
https://docs.oracle.com/en/java/javase/25/docs/specs/jni/intro.html
https://pybind11.readthedocs.io/en/stable/basics.html`,

`SCRIPT
This slide shows a Python-to-C++ boundary using pybind11. On the left is a small C++ function. The binding layer exposes that function as a Python module and converts values between Python objects and C++ types.

[Trace the flow on the right.] Python calls fastmath.add. The binding layer receives the call, converts the two arguments, invokes the compiled C++ function, and converts the result back into a Python value.

This is useful architecture, but the example is not evidence that calling C++ is automatically faster. Adding two integers is so small that the boundary-crossing overhead may matter more than the calculation. Native integration becomes most valuable when one call performs substantial work, or when the application needs an existing native library.

Java has a comparable route through JNI. Modern Java also provides the Foreign Function and Memory API, which Oracle recommends when it is applicable. In either case, native code can add capability or performance, but it also adds build, packaging, and platform-compatibility work.

TRANSITION
This is why performance claims need more context than a language label.

REFERENCE NOTES
Illustrative integration example only; not a benchmark.
https://pybind11.readthedocs.io/en/stable/basics.html
https://docs.python.org/3/extending/extending.html
https://docs.oracle.com/en/java/javase/25/docs/specs/jni/intro.html`,

`SCRIPT
There is no responsible universal answer to “How many times faster is Java or C++ than Python?” Performance depends on the work being measured and the complete execution path.

Java can benefit from HotSpot’s runtime profiling and JIT optimization, especially after warm-up. A Python application may spend most of its time in CPython bytecode, or it may delegate the heavy work to highly optimized native extensions. Those are very different cases.

A fair comparison therefore measures a representative application under comparable conditions. We should separate startup time from steady-state throughput, include warm-up where relevant, use equivalent libraries, account for calls across language boundaries, and observe memory as well as speed.

The small addition example on the previous slide demonstrates integration—not a performance result. The honest conclusion is that architecture and workload determine performance more reliably than slogans do.

TRANSITION
With that in mind, we can turn the technical comparison into a practical decision framework.

REFERENCE NOTES
https://docs.oracle.com/javase/tutorial/getStarted/intro/definition.html
https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html
https://docs.python.org/3/extending/extending.html
https://pybind11.readthedocs.io/en/stable/basics.html`,

`SCRIPT
Instead of asking which language is “best,” I would evaluate an application through three questions.

First, deployment: where must the program run, and can we reliably provide the required JVM, Python interpreter, packages, or native binaries?

Second, development: which ecosystem has the libraries we need, and which workflow helps the team build, test, and maintain the system clearly?

Third, performance: what part of the real workload must be fast? Do we care about startup, long-running throughput, memory, or a small computational kernel? That requirement should be measured with a representative benchmark, not assumed from the language name.

These criteria do not produce one winner for every project. They reveal the trade-offs. Java often makes the runtime contract explicit; Python often reduces friction at the source level; native extensions can change either system’s performance and deployment story.

TRANSITION
That leads to the main conclusion of this presentation.

REFERENCE NOTES
This framework is a synthesis derived from the documented execution and deployment models.
https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html
https://docs.python.org/3/library/dis.html
https://docs.python.org/3/extending/extending.html`,

`SCRIPT
The central difference is where each ecosystem places execution complexity.

Java makes the compiler, class-file format, and virtual machine explicit. That supports a standardized runtime contract, while still requiring a compatible JVM and dependencies on the target system.

Python gives the programmer a more direct source-level experience. CPython manages bytecode internally, and native extensions can be introduced selectively when an application needs existing C or C++ libraries or substantial compiled work.

Neither model removes complexity; each organizes it differently. So the strongest language choice is the one that matches the required deployment environment, the team’s development needs, and measured performance on the real workload.

If you remember one sentence, let it be this: do not ask only whether a language is compiled or interpreted—ask what artifact is produced, what runtime executes it, and what the complete path requires.

Thank you for listening.

TRANSITION
I will leave the sources on screen and welcome your questions.

REFERENCE NOTES
https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html
https://docs.python.org/3/library/dis.html
https://docs.python.org/3/extending/extending.html`,

`SCRIPT
This final slide lists the primary references behind the technical claims. The Oracle introductory page is useful for the basic Java model, although it explicitly targets JDK 8, so the architecture discussion also uses the Java Virtual Machine Specification for SE 25. The Python documentation supports the CPython bytecode, module-cache, and extension discussions. The pybind11 and JNI documentation support the native-integration examples.

The original comparison document is the source material for the presentation. I have treated the C++ addition example as an illustration of a language boundary, not as benchmark evidence.

Thank you again. I am happy to answer questions about the JVM, CPython bytecode, portability, or native extensions.

REFERENCE NOTES
Primary reference document: /Users/gaozhenchao/Desktop/c++.docx
https://docs.oracle.com/javase/tutorial/getStarted/intro/definition.html
https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html
https://docs.python.org/3/faq/general.html
https://docs.python.org/3/library/dis.html
https://docs.python.org/3/tutorial/modules.html
https://pybind11.readthedocs.io/en/stable/basics.html
https://docs.python.org/3/extending/extending.html
https://docs.oracle.com/en/java/javase/25/docs/specs/jni/intro.html`,
];

await fs.mkdir(outputDir, { recursive: true });
const deck = await PresentationFile.importPptx(await FileBlob.load(input));

if (deck.slides.items.length !== scripts.length) {
  throw new Error(`Expected ${scripts.length} slides, found ${deck.slides.items.length}`);
}

for (let index = 0; index < scripts.length; index += 1) {
  const slide = deck.slides.items[index];
  slide.speakerNotes.text = scripts[index];
  slide.speakerNotes.setVisible(true);
}

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(output);

const verification = await deck.inspect({
  kind: 'slide,notes',
  maxChars: 20000,
});
await fs.writeFile(
  '/Users/gaozhenchao/Code/AS_CSC++/speaker-script/.build/notes-verification.ndjson',
  verification.ndjson,
);

console.log(`Wrote ${output}`);
console.log(`Slides: ${deck.slides.items.length}`);
