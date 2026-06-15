# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/48811dff-0ed5-4a42-a2e0-d728caa087c2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Inspiration

STEM students live in two parallel worlds: they solve complex problems in mathematics, physics, computer science, and engineering, yet most of their screen time still goes into short-form content. Traditional online learning often struggles to hold attention, especially in subjects that require repeated practice and conceptual clarity.

Eduflix was inspired by a simple idea: what if the infinite scroll could be redesigned for STEM education? Instead of fighting the way students already consume content, we wanted to turn that same habit into a structured learning experience that helps them move through equations, problem-solving patterns, and technical concepts one swipe at a time.

## What it does

Eduflix converts any STEM syllabus into an endless, short-form feed of curriculum-aligned micro-lessons.

- A student uploads a syllabus, chapter, set of notes, or topic list.
- The platform breaks the material into atomic concepts and learning objectives.
- It then generates bite-sized lessons explained through engaging narratives, visual analogies, and interactive-style progression.
- Each swipe maps back to a real learning objective, so students are not just consuming content — they are completing parts of their syllabus.

For example:
- Newton's laws can become a high-stakes sci-fi battle sequence.
- Graph traversal can become a mission through interconnected fantasy worlds.
- Derivatives can be taught as real-time change in a racing simulation.

The goal is to make hard STEM concepts feel approachable, memorable, and addictive in the same way short-form entertainment feels addictive.

## How we built it

Eduflix was built using Gemini 3's multimodal capabilities, with the system organized into three core layers.

**1. Syllabus intelligence**
Gemini 3 ingests PDFs, lecture notes, textbooks, and topic outlines, then extracts:
- Topics and subtopics.
- Concept dependencies.
- Learning objectives.
- The order in which students should learn ideas.

This is especially important in STEM, where topics build on one another. For example, a learner should understand limits before derivatives, and derivatives before applications of optimization.

**2. Multimodal lesson generation**
Once the concepts are identified, Gemini 3 generates:
- Story-driven explanations.
- Visual prompts for diagrams and concept illustrations.
- Narration-ready scripts for short-form delivery.
- Fandom or narrative wrappers that make abstract content feel emotionally engaging.

This makes it possible to explain a concept like $F = ma$ not only as a formula, but as a memorable event inside a story world the learner already understands.

**3. Dynamic feed and mastery tracking**
The generated lessons are sequenced into an infinite feed. As a student progresses, Eduflix tracks which objectives are completed and how much of the syllabus has been covered.

This transforms learning from passive watching into visible momentum, such as:
- "You have completed 60% of mechanics."
- "You have mastered 8 out of 10 graph algorithm concepts."

## Challenges we ran into

One of the biggest challenges was balancing engagement with correctness. In STEM education, a lesson cannot just be entertaining — it has to be precise, logically sound, and aligned with the syllabus.

Another challenge was preserving conceptual depth in a short format. Compressing topics like calculus, recursion, or electromagnetism into micro-lessons without oversimplifying them required careful prompt design and structured generation.

We also had to maintain consistency across a stream of lessons. Variables, notation, definitions, and concept dependencies all need to remain stable from one lesson to the next, especially in technical subjects.

Finally, generating content that felt fast enough for an infinite-scroll experience while still producing useful STEM explanations required major iteration on the generation pipeline.

## Accomplishments that we're proud of

We are proud that Eduflix turns dense STEM material into a format that feels lightweight without losing academic structure.

Some accomplishments we are especially proud of:
- Building a working prototype that converts real educational material into a short-form learning feed.
- Structuring the system so every lesson connects back to a specific syllabus objective.
- Showing that Gemini 3 can generate explanations, narrative framing, and visual lesson components in one unified workflow.
- Making difficult STEM subjects feel less intimidating and more emotionally engaging.

## What we learned

We learned that STEM students do not just need better content — they need better packaging for that content.

We also learned that narrative framing can significantly improve how students approach abstract ideas. A concept becomes easier to remember when it is tied to a strong visual or emotional context instead of being presented as an isolated definition.

Most importantly, we learned that multimodal generation is especially powerful in STEM because these subjects naturally combine text, equations, diagrams, and sequential reasoning. A system that can handle all of these together creates a much better learning experience than one that treats them separately.

## What's next for Eduflix

Our next step is to make Eduflix even more useful for serious STEM learners.

We want to add:
- Personalized mastery graphs for each concept.
- Interactive problem-solving mode with step-by-step hints.
- Better visual generation for diagrams, plots, and scientific illustrations.
- Exam-focused pathways for standardized test prep and university courses.
- Teacher dashboards for classroom use.

In the long run, we want Eduflix to become a STEM learning layer that sits between entertainment and education — a system where scrolling can genuinely lead to mastery.

For example, instead of passively consuming content, a student could move through a sequence like:

$$
\text{Limits} \rightarrow \text{Derivatives} \rightarrow \text{Applications of Derivatives} \rightarrow \text{Optimization}
$$

That is the future we are building toward: turning short attention into long-term understanding.
