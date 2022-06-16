function chooseInputType(buttonType) {
  if (buttonType !== 'text' || buttonType !== 'number')
    $('.minimum-err').text('');

  $('.attrs').slideDown(500);
  $('.button-type').prop('value', buttonType);

  $('.f-control').addClass('hidden');

  $('button.border-nex').removeClass('border-nex');
  $('.' + buttonType + '-button').addClass('border-nex');

  if (
    buttonType === 'text' ||
    buttonType === 'number' ||
    buttonType === 'date' ||
    buttonType === 'datetime'
  ) {
    $('#default_value').prop('type', buttonType); // input type
    // labels
    $('#default_label').text('Default ' + buttonType); // label text
    $('#minimum_label').text('Minimum ' + buttonType); // label text
    $('#maximum_label').text('Maximum ' + buttonType); // label text

    if (buttonType === 'text') {
      $('#maximum_label').text('Maximum length');
      $('#minimum_label').text('Minimum length');
    }
    // show inputs
    $(
      '#default_control , #minimum_control , #maximum_control, #unit_control'
    ).removeClass('hidden');
  }

  if (
    buttonType === 'text' ||
    buttonType === 'number' ||
    buttonType === 'textarea'
  ) {
    $('#minimum').prop('type', 'number');
    $('#maximum').prop('type', 'number');
    $('#minimum').prop('min', '2');
    $('#minimum').prop('value', '2');
  }

  if (buttonType === 'textarea') {
    $('#default_area_control,#minimum_control , #maximum_control').removeClass(
      'hidden'
    );
    $('#maximum_label').text('Maximum length');
    $('#minimum_label').text('Minimum length');
  }

  if (buttonType === 'date' || buttonType === 'datetime') {
    $('#unit_control').addClass('hidden');
    $('#default_control').addClass('hidden');
    $('#minimum_control').addClass('hidden');
    $('#maximum_control').addClass('hidden');
  }

  if (buttonType === 'email') {
    $('#default_value').prop('type', buttonType);
    $('#default_label').text('Default ' + buttonType); // label text
    $('#default_control').removeClass('hidden');
  }

  if (
    buttonType === 'check-boxes' ||
    buttonType === 'radio-buttons' ||
    buttonType === 'single-select' ||
    buttonType === 'multiple-select'
  ) {
    $('#choices_control').removeClass('hidden');
    $('#default_control').addClass('hidden');
    $('#maximum_label').text('Maximum length');
    $('#minimum_label').text('Minimum length');
    $('#choices_label').text(
      buttonType.charAt(0).toUpperCase() + buttonType.slice(1) + ' Choices'
    );
    $('#choices').prop('required', 'required');
    $('#choices_label').append('*');
  }

  $('#minimum').blur(callBackOnBlur);

  $('#maximum').blur(callBackOnBlur);

  function callBackOnBlur() {
    if (buttonType === 'number' || buttonType === 'text') {
      if (
        parseInt($('#minimum').val()) > parseInt($('#maximum').val()) ||
        parseInt($('#maximum').val()) == parseInt($('#minimum').val())
      ) {
        $('.minimum-err').text('Minmum must be less than maximum');
        disableSubmit();
      } else {
        $('.minimum-err').text('');
        enableSubmit();
      }
    }
  }

  function disableSubmit() {
    $('.attr-button').prop('disabled', true);
    $('.attr-button').addClass('bg-gray-200');
  }

  function enableSubmit() {
    $('.attr-button').prop('disabled', false);
    $('.attr-button').removeClass('bg-gray-200');
  }
}

$(document).ready(function () {
  // animate the attrs modal
  $('.create-attribute').click(function () {
    $('.nex-modal').slideDown(500);
  });

  $('.close-nex-modal').click(function () {
    $('.attrs').slideUp(500);
    $('.nex-modal').slideUp(500);
  });

  $('.close-errs-button').click(function () {
    $('.errs-box').slideUp(500);
  });

  $('.msg-button').click(function () {
    $('.msg-box').slideUp(500);
  });

  setTimeout(function () {
    $('.msg-box').slideUp(500);
  }, 7000);

  $('.chosen-select').chosen({ width: '510px' });

  function delChoice() {
    console.log('here');
  }

  $('.add-choice').click(function (e) {
    const choice_value = $('#choice').val();
    $(
      '.choices-list'
    ).append(`<li class="my-1 id="${new Date().getTime()}">${choice_value} 
    <button type="button" class="inline-block  choice-delete-button" id="${new Date().getTime()}">X</button>
    </li>  
    `);
  });

  $(document).on('click', '.choice-delete-button', function (e) {
    const li_id = $(this).attr('id');
    $('#' + li_id)
      .parent()
      .remove();
  });
});
