class StaticPagesController < ApplicationController

  def home
  end

  def index
  end

  def ruby
  end

  def js
  end

  def puzzle
  end

  def jquery
  end

  def maps
    render layout: 'layouts/jqueryprojects'
  end
  
end