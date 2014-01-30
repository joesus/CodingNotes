class ContactMailer < ActionMailer::Base
  default from: "joesusnick@gmail.com"
  default to: "joesusnick@gmail.com"

  def new_message(message)
  	@message = message
  	mail(subject: "Coding Notes - #{message.subject}")
  end
end