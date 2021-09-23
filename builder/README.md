# Setup
1. Clone the repo and then navigate to '/builder' in your terminal
2. Type 'npm install' to install dependencies
3. Add a new theme inside '/themes'
4. To build a theme, inside './builder' run 'gulp buildThemes'
5. To watch and update files automatically whilst creating themes run 'gulp watchThemes' 

# Builder base
Inside the root folder is the file 'builder-base.css' this is a theme dependency, all style variables are applied to classes here.

# Theme Template
Duplicate the 'theme-template' folder to create a new theme. Move it into './themes' once complete and make sure to run the build script.