class UserValidator < ActiveModel::Validator
  def validate(record)
    # define bad names
    @badnames = ['nil', 'null', 'drop table;']

    # validate email
    record.email = record.email.strip
    record.errors.add :email, 'Is not an email' unless record.email.match? '([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})'

    # validate displayname
    record.displayname = record.displayname.strip
    record.errors.add :displayname, 'Displayname is shorter than 2 symbols' if record.displayname.size < 2
    record.errors.add :displayname, 'Displayname is longer than 20 symbols' if record.displayname.size > 20
    record.errors.add :displayname, 'Special symbols are not allowed' unless record.displayname.match? '^[a-zA-Z0-9 ]+$'
    record.errors.add :displayname, 'Bad displayname' if @badnames.include? record.displayname.downcase

    # validate avatar_url
    record.avatar_url = record.avatar_url.strip
    record.errors.add :avatar_url, 'Bad avatar url' if @badnames.include? record.avatar_url.downcase
  end
end
