# Trigonometry Lab

An interactive version of NCERT Class 10 Maths, Chapter 8 (Introduction to Trigonometry), built for the Shreeji Education Zone assessment.

The whole chapter is one tap-through lesson: 87 screens covering every concept, all 12 examples and every exercise question, in the same order as the textbook. Tap the right side of the screen to go forward and the left side to go back, the same way chapters work in the main app.

## Running it

```bash
npm install
npm run dev     # opens on http://localhost:5173
```

Other scripts:

- `npm run build` type-checks and builds into `dist/`
- `npm run preview` serves the build locally
- `npm run check:content` checks all the chapter content (more on this below)

## How it works

The main idea is that the chapter is stored as **data**, not hard-coded screens.

Every example and exercise is an object in `src/content/` with a question, a triangle, and a list of steps. Each step says what to show, which sides of the triangle to highlight and which lengths to reveal. One component, `ProblemPlayer`, reads any of these and animates it step by step, and `TriangleFigure` draws the triangle. So there are 66 problems but only one engine. Adding a problem, or a whole new chapter, is mostly adding data.

Some ideas need more than a step-by-step solution, so they have their own simulations in `src/simulations/`. For example, a slider to change the angle and watch all six ratios update, an animation that shrinks the angle to 0° and grows it to 90°, and a "lab" where you try to break sin²A + cos²A = 1 at any angle.

The order of the lesson is just a list in `src/deck/slides.tsx`. `Deck.tsx` handles taps, swipes and arrow keys. Taps on buttons and sliders are ignored, so the interactive parts still work inside the lesson.

Sides are always coloured the same way: red is opposite, blue is adjacent, orange is the hypotenuse. When a solution switches from angle A to angle C, you can see the colours swap.

## Exercises: try first

The textbook doesn't give exercise solutions, and showing them straight away would just let students copy. So exercise solutions are locked:

- For MCQs, the solution opens after you pick an answer.
- For the rest, you can take a hint (only the first step), then press "I've tried" to see the full solution. At the end you mark whether you got it right.

Those results show up on the progress page (`#/progress`) with a list of questions to revisit. Examples stay open, because the textbook already solves them.

Teachers can see everything directly. This is based on the logged-in user from the main app (`localStorage.user`): if `role` is `"student"`, or there's no user at all, exercises stay locked. Any other role opens them, and a switch in the Contents panel lets a teacher preview the student view.

## Checking the content

`npm run check:content` renders every formula (628 of them) with KaTeX in strict mode. It also checks that IDs are unique, that MCQ answers point to real options, and that every side a step highlights actually exists in its triangle. It catches typos and broken references. It can't tell whether the maths itself is right, so that still needs a human check against the textbook and the NCERT answer key.

## Deploying

It builds to a plain static site with hash routing, so it works on any static host. On Vercel or Netlify use build command `npm run build` and output folder `dist`.

## Built with

React, TypeScript, Vite, Tailwind CSS, Framer Motion (animations), KaTeX (maths) and React Router. Every figure is drawn in SVG, with no image files. Icons are SVG files in `src/assets/icons/`.
