class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def marvin
    @user = User.from_omniauth(request.env['omniauth.auth'])

    if @user.nil?
      set_flash_message(:danger, :failure, kind: '42',
                        reason: 'it failed to provide a valid uid. Try again later') if is_navigational_format?
      return redirect_to root_path
    end

    if @user.persisted?
      if @user.banned?
        if @user.ban_reason.nil? || @user.ban_reason.empty?
          set_flash_message(:danger, :banned) if is_navigational_format?
        else
          set_flash_message(:danger, :banned_with_reason, reason: @user.ban_reason) if is_navigational_format?
        end
        return redirect_to root_path
      end
      @user.update(otp_validated: false)

      sign_in_and_redirect @user, :event => :authentication
      set_flash_message(:notice, :success, kind: '42') if is_navigational_format?

      if (@user.otp_required_for_login)
        set_flash_message(:warning, :otp_required) if is_navigational_format?
      else
        set_flash_message(:info, :admin) if is_navigational_format? && @user.admin
        set_flash_message(:info, :owner) if is_navigational_format? && @user.owner
      end
    else
      session['devise.marvin_data'] = request.env['omniauth.auth']
      redirect_to root_path
    end
  end

  def after_sign_in_path_for(resource)
    if resource.first_login?
      resource.update(first_login: false)
      '/#/settings'
    else
      root_path
    end
  end
end
