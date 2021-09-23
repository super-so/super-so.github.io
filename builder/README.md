# Setup
1. Clone the repo and then navigate to '/builder' in your terminal
2. Type 'npm install' to install dependencies
3. Add a new theme inside '/themes'
4. To build a theme, inside './builder' run 'gulp build'
5. To watch and update files automatically whilst creating themes run 'gulp watch' 

# Builder base
Inside the root folder is the file 'builder-base.css' this is a theme dependency, all style variables are applied to classes here. If changes are made to the builder-base then it's vital to rebuild and update all themes for changes to be applied.

# Theme Template
Copy the contents of 'theme-template.css' into Super and create a theme using the live preview. Once complete, use the comments within the template file to split the file into two and add it into its own folder in the repo. Then use 'gulp build' to build the files. 