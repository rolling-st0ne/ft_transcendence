# transcendence

### To start in docker
1. Setup your 42 API OAuth app and set FT_ID and FT_SECRET in `docker-compose.yml`
2. Run `docker-compose up --build`

### To run local development environment
1. Install PostgreSQL and start it's service
2. [Install Ruby on Rails](https://edgeguides.rubyonrails.org/getting_started.html#creating-a-new-rails-project-installing-rails)
(you don't need to install SQLite3 because you already have PostgreSQL)
> use rbenv so you can install Ruby 3.0.0 (https://gorails.com/setup)
> and also make sure `yarn` is installed in addition to node.js
3. `cd ./srcs/app/srcs`
4. `bundle install`
5. `yarn install` (you may encounter [syntax error if you got python3 instead of python2](https://stackoverflow.com/a/62018221))
> you can check `npm list` and `yarn list` for installed node-modules and dependencies
6. Comment out username, password and host in `./srcs/app/srcs/config/database.yml`
7. `./bin/rails db:setup` (you may encounter [role does not exist](https://stackoverflow.com/a/16974197) and [insufficient rights](https://stackoverflow.com/a/31669921) errors)
8. Run development environment server: `./bin/rails s`

### To run local production environment
1. I assume you already did development environment 1-9
2. Precompile assets: `./bin/rails assets:precompile`
3. Run `./bin/rails s -e production`
