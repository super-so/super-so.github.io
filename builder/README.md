# Setup
1. Clone the repo and then navigate to '/builder' in your terminal
2. Type 'npm install' to install dependencies

# Builder base
Inside the root folder is the file 'builder-base.css' this is a theme dependency, all style variables are applied to classes here. If changes are made to the builder-base then it's vital to rebuild and update all themes for changes to be applied.

# Creating a new theme
1. Copy the contents of 'theme-template.css' and paste into the CSS code tab on a Super site
2. Create a theme using the live preview on Super
3. Once finished, use the comments within the template file to split the file into two files naming them 'theme-name-start.css' and 'theme-name-end.css' respectively
4. Create a new folder in '/builder/theme' and move the files into the folder
5. Run command 'gulp build' in the terminal to combine and minify the theme files
6. This should output a new file in the folder called 'theme-name.css'
7. Push to the repo
