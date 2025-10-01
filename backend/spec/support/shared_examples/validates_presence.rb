RSpec.shared_examples 'validates presence of' do |field|
  it "validates presence of #{field}" do
    subject.send("#{field}=", nil)
    expect(subject).not_to be_valid
    expect(subject.errors[field]).to include("can't be blank")
  end
end

RSpec.shared_examples 'validates numericality of' do |field, options = {}|
  it "validates numericality of #{field}" do
    subject.send("#{field}=", 'not a number')
    expect(subject).not_to be_valid
    expect(subject.errors[field]).to include('is not a number')
  end

  if options[:greater_than]
    it "validates #{field} is greater than #{options[:greater_than]}" do
      subject.send("#{field}=", options[:greater_than] - 1)
      expect(subject).not_to be_valid
      expect(subject.errors[field]).to include("must be greater than #{options[:greater_than]}")
    end
  end
end
