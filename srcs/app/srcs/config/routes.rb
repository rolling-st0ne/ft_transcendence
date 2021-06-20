Rails.application.routes.draw do
  root 'pong#index'

  post '2fa', to: 'api/two_factor#validate', as: 'two_factor_validate'

  namespace :api do
    get 'settings/2fa', to: 'two_factor#status'
    post 'settings/2fa', to: 'two_factor#enable'
    patch 'settings/2fa', to: 'two_factor#disable'
    resources :users do
      get 'matches/:id/tournament', to: 'users#tournament_users'
      resources :matches
      resources :guild_invitations
    #  post 'matches/invite_user', to: 'matches#invite_user'
    end
    resources :settings
    resources :rooms
    post 'rooms/:id', to: 'rooms#create'
    resources :messages
    resources :room_members
    resources :room_admins
    post 'users/:id/add_friend', to: 'users#add_friend'
    post 'users/:id/accept_friend', to: 'users#accept_friend'
    post 'users/:id/remove_friend', to: 'users#remove_friend'
    resources :direct_rooms, only: [:index, :create, :show, :update]
    resources :direct_messages, only: [:index, :create, :show]

    get 'admin/users', to: 'administration#users'
    patch 'admin/users/:id', to: 'administration#user_update'
    get 'admin/chats', to: 'administration#chatlist'
    delete 'admin/chats/:id', to: 'administration#chat_destroy'

    resources :tournaments

    resources :guilds do
      resources :wars
    end
    get 'users_not_in_guild', to: 'guilds#users_available'
    get 'guilds/:id/members', to: 'guilds#show_members'
    get 'guilds/:id/requests', to: 'guilds#show_requests'
    put 'users/:id/leave_guild', to: 'users#remove_from_guild'
    put 'users/:id/join_guild', to: 'users#add_to_guild'
    get 'guilds/:id/war_invites', to: 'wars#index_war_invites'
    put 'guilds/:guild_id/war_invites/:id', to: 'wars#accept'
    get 'guilds/:id/war_requests', to: 'wars#index_war_requests'

    resources :wars

    post 'tournaments/:id/join', to: 'tournaments#join'
    post 'tournaments/:id/leave', to: 'tournaments#leave'
    post 'tournaments/:id/open', to: 'tournaments#open'
    post 'tournaments/:id/close', to: 'tournaments#close'
    post 'tournaments/:id/begin', to: 'tournaments#begin'
    post 'tournaments/:id/finish', to: 'tournaments#finish'
  end

  get '/pong', to: 'pong#index'

  devise_for :users, controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks',
    sessions: 'users/sessions'
  }
  devise_scope :user do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session_path
  end

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  get '*unmatched_route', to: 'application#raise_not_found'

  mount ActionCable.server => '/cable'
end
