class ApplicationController < ActionController::Base
    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActionController::RoutingError, with: :not_found
    # rescue_from Exception, with: :not_found

    def raise_not_found
        raise ActionController::RoutingError.new("No route matches #{params[:unmatched_route]}")
    end

    def not_found
        render file: "#{Rails.root}/public/404.html", status: :not_found
    end

    def error
        render file: "#{Rails.root}/public/500.html", status: :not_found
    end
end
