RSpec.shared_examples 'requires authentication' do |method, path, params = {}|
  it 'returns unauthorized without token' do
    send(method, path, params: params)
    expect(response).to have_http_status(:unauthorized)
    expect(json_response['success']).to be false
  end

  it 'returns unauthorized with invalid token' do
    headers = { 'Authorization' => 'Bearer invalid-token' }
    send(method, path, params: params, headers: headers)
    expect(response).to have_http_status(:unauthorized)
    expect(json_response['success']).to be false
  end
end

RSpec.shared_examples 'API endpoint' do |method, path|
  it_behaves_like 'requires authentication', method, path

  it 'returns JSON content type' do
    user = create(:user)
    send(method, path, headers: auth_headers(user))
    expect(response.content_type).to include('application/json')
  end
end
