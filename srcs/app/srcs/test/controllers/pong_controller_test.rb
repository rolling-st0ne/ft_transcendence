require "test_helper"

class PongControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get pong_index_url
    assert_response :success
  end
end
