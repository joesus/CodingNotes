class Message < ActiveRecord::Base

  include ActiveModel::Validations
  include ActiveModel::Conversion
  extend ActiveModel::Naming


  validates :name, :email, :subject, :body, presence: true
	VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i
  validates :email, format: { with: VALID_EMAIL_REGEX }

  def persisted?
    false
  end
end
