CodingNotes::Application.routes.draw do


  root 'static_pages#home'
  match '/about',  to: "static_pages#about",    via: 'get'
  match '/index',  to: "static_pages#index",    via: 'get'
  match '/jquery',  to: "static_pages#jquery",  via: 'get'
  match '/ruby',   to: "static_pages#ruby",     via: 'get'
  match '/js',     to: "static_pages#js",       via: 'get'
  match '/heroku', to: "static_pages#heroku",   via: 'get'
  match '/contact', to: "static_pages#contact",
    via: 'get'
  match '/puzzle', to: "static_pages#sliding-puzzle",via: 'get'
  match '/maps',   to: "static_pages#maps",     via: 'get'
  match '/bounty', to: "static_pages#bounty",   via: 'get'
  match '/bounty/about', to: "static_pages#bountyhunterabout", via: 'get'
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end
  
  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
