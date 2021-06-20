class Api::SettingsController < ApplicationController
    include ApplicationHelper
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!
    before_action :check_2fa!
    before_action :sign_out_if_banned
    before_action :define_filters

    def index
        render json: current_user, :only => @filters
    end

    def update
        @user = current_user
        if @user.update(user_params)
            render json: @user, :only => @filters, status: :ok
        else
            render json: @user.errors, status: :unprocessable_entity
        end
    end

    private

    def define_filters
        @filters = %i[id displayname email avatar_url avatar_default_url]
    end

    def user_params
        params.require(:setting).permit(%i[displayname email avatar_url])
    end
end
