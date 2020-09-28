#BSI UI Library

Purpose: Generate simple grid based screens based on metadata described via JSON.

Support launching of filters prior to screen render. OPTIONAL
Support display of grid based on metadata.
Support display of CRUD form to edit entity being displayed in the grid. Field validation is included in metadata.
Supported Use Cases:

Independent rendering of metadata based Grid.
Independent rendering/usage of metadata based form.
Single Entity Rendering - Filter/Grid/Form rendering based on metadata.
Two level/parent-child rendering - A parent-child type relationship with/without filters and form for CRUD operations.
Notes:

Meta data MUST describe all elements/aspects of above supported use cases.
Meta data MUST NOT include any JavaScript.
Product/Project specific code must not be added to the library project.
Every change/enhancement made to the library must be documented in code. Sufficient description must be provided.
Guidelines/Process For Making Enhancements:

Must document proposed changes.
Review proposed changes with Sudhir/Igor/Vinit.
Implement changes or hand-off implementation to Strategic Solutions team. MUST follow #1 & #2
Code Review. - This is a must.
Test all impacted cases/projects.