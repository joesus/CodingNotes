CodingNotes::Application.routes.draw do

  root 'static_pages#home'

  match '/about',   to: "static_pages#about",     via: 'get'
  match '/index',   to: "static_pages#index",     via: 'get'
  match '/jquery',  to: "static_pages#jquery",    via: 'get'
  match '/ruby',    to: "static_pages#ruby",      via: 'get'
  match '/js',      to: "static_pages#js",        via: 'get'
  match '/heroku',  to: "static_pages#heroku",    via: 'get'
  match '/puzzle',  to: "static_pages#sliding-puzzle",via: 'get'
  match '/email',   to: "static_pages#email",     via: 'get'

  match '/contact', to: "contact#new",            via: 'get'
  match '/contact', to: "contact#create",         via: 'post'
  
  match '/maps',    to: "jqueryprojects#maps",    via: 'get'
  match '/bounty',  to: "jqueryprojects#bounty",  via: 'get'
  match '/bounty/about', to: "jqueryprojects#bountyhunterabout", via: 'get'
  match '/bountyhunterlist', to: "jqueryprojects#bountyhunterlist", via: 'get'

  match '/dec13',   to: "posts#dec2013",          via: 'get'
  match '/jan14',   to: "posts#jan2014",           via: 'get'
  match '/feb14',   to: "posts#feb2014",           via: 'get'
end
