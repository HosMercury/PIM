function chooseInputType(buttonType) {
  console.log(buttonType);

  // $('#default').prop('disabled', false);
  // $('#minimum').prop('disabled', false);
  // $('#maximum').prop('disabled', false);

  // $('#required').prop('type', 'value');
  // $('#minimum').prop('type', 'value');
  // $('#maximum').prop('type', 'value');

  if (
    buttonType === 'text' ||
    buttonType === 'number' ||
    buttonType === 'date'
  ) {
    $('#required').prop('type', buttonType);
    $('#minimum').prop('type', buttonType);
    $('#maximum').prop('type', buttonType);
    // labels
    $('#required_label').text('Required ' + buttonType);
    $('#minimum_label').text('Minimum ' + buttonType);
    $('#maximum_label').text('Maximum ' + buttonType);
  }

  if (buttonType === 'email') {
    $('#required').prop('type', buttonType);
    $('#minimum').prop('type', buttonType);
    $('#maximum').prop('type', buttonType);
    $('#default').prop('disabled', true);
    $('#minimum').prop('disabled', true);
    $('#maximum').prop('disabled', true);
    $('#unit').prop('disabled', true);
  }

  if (buttonType === 'checks' || buttonType === 'radios') {
    $('#options').prop('disabled', false);
  }
}

$(document).ready(function () {
  $('.create-attribute').click(function () {
    $('.nex-modal').toggle('hidden');
  });
  $('.close-nex-modal').click(function () {
    $('.nex-modal').toggle('hidden');
  });
});
