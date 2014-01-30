class ContactController < ApplicationController

	#get /contact
  def new
  	@message = Message.new
  end

  #post /contact
  def create
  	@message = Message.new(message_params)

	  if @message.save
	  	ContactMailer.new_message(@message).deliver
	  	flash[:success] = "Message sent! We'll be in touch shortly!"
	  	redirect_to contact_path
	  else
	  	render :new
	  end
	end

private

  def message_params
    params.require(:message).permit(:name, :email, :subject, :body)
  end
end