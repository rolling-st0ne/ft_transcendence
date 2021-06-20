FROM	ruby:3.0.0

RUN		apt-get update && apt-get -y upgrade
RUN		apt-get update && apt-get -y install curl vim gnupg2
RUN		curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN 	curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN		echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# add psql 12 repos
RUN		wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN		echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list

RUN		apt-get update
RUN		apt-get install -y nodejs yarn postgresql-client-12

WORKDIR	/app
RUN		gem install bundler

COPY    ./srcs/ /app/
RUN		BUNDLE_GEMFILE="/app/Gemfile" bundle install
RUN		yarn install
RUN     bin/rails assets:precompile

# Add a script to be executed every time the container starts.
COPY	entrypoint.sh /usr/bin/
RUN		chmod +x /usr/bin/entrypoint.sh
EXPOSE	3000
ENTRYPOINT ["entrypoint.sh"]
