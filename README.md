# Angst

A simple school score calculator/simulator with a custom DSL.

This was developed when I was in university and wanted a way to simulate final
course scores based on the weights laid out by each professor at the beginning
of the semester.

It became somewhat popular among people attending the Computer Science at the
Federal University of São Carlos between 2010 and 2012, especially close to the
end of semesters, where it was common to see the angst in people's eyes while
using the tool, thus the name :-)

It has two versions: `v1` was the most widely used, and `v2` is a redesign I
worked on that was more mobile-friendly. As best as I can recall, I never
really released `v2`.

The most interesting part is the compiler for the high-level score formula
language, built in JavaScript. This was done when I was learning about
compilers; it's certainly a case of over-engineering :-)

There are live previews:
- https://alnvdl.github.io/Angst/v1
- https://alnvdl.github.io/Angst/v2

It's certainly outdated, being based on jQuery, but someone may take interest
on extending it to support more complex formulas and improve the usability.
