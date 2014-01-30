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
	  	flash[:success] = "Message was sent"
	  	redirect_to contact_path
	  else
	  	flash.now[:alert] = 'Please fill all fields'
	  	render :new
	  end
	end

private

  def message_params
    params.require(:message).permit(:name, :email, :subject, :body)
  end
end