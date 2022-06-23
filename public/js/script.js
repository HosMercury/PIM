function chooseInputType(buttonType) {
  enableSubmit();
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
    $('#default_label').text(
      'Default ' + buttonType.charAt(0).toUpperCase() + buttonType.slice(1)
    ); // label text
    $('#minimum_label').text(
      'Minimum ' + buttonType.charAt(0).toUpperCase() + buttonType.slice(1)
    ); // label text
    $('#maximum_label').text(
      'Maximum ' + buttonType.charAt(0).toUpperCase() + buttonType.slice(1)
    ); // label text

    if (buttonType === 'text') {
      $('#maximum_label').text('Maximum Length');
      $('#minimum_label').text('Minimum Length');
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
    $('#maximum_label').text('Maximum Length');
    $('#minimum_label').text('Minimum Length');
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
    li_count = $('.choices-list').children().length;
    if (li_count < 1) {
      disableSubmit();
      $('.please-add-choices').show(); // label text
    } else {
      enableSubmit();
    }
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
}

function disableSubmit() {
  $('.attr-button').prop('disabled', true);
  $('.attr-button').addClass('bg-gray-200');
}

function enableSubmit() {
  $('.attr-button').prop('disabled', false);
  $('.attr-button').removeClass('bg-gray-200');
}

// Document Ready
// ---------------------------------------
$(document).ready(function () {
  // show- modal is active to enable / disable click on table

  const type = $('.button-type').val();
  chooseInputType(type);

  // animate the attrs modal
  $('.create-attribute').click(function () {
    $('.nex-modal').slideDown(500);
  });

  $('.close-nex-modal').click(function () {
    $('.attrs').slideUp(500);
    $('.nex-modal').slideUp(500);
  });

  $('.close-nex-modal-show').click(function () {
    $('.nex-modal-show').slideUp(500);
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

  $('.chosen-select').chosen({ width: '400px' });

  let li_count = 0;

  function generateAppendedChoices(choice_value) {
    return `<li class="my-1 inline-block p-2 py-1 border border-gray-50 rounded-md bg-gray-50" id="li-${new Date().getTime()}">${choice_value} 
    <input type="hidden" name="choices[]" value="${choice_value}" minlength="2"/>
    <button type="button" class="inline-block choice-delete-button" id="${new Date().getTime()}">X</button>
    </li>  
    `;
  }

  let old_choices_list = $('.old-choices-list').val();
  if (old_choices_list) {
    old_choices_list = JSON.parse(old_choices_list);

    old_choices_list.forEach(function (choice_value) {
      $('.choices-list').append(generateAppendedChoices(choice_value));
    });
    enableSubmit();
    $('.please-add-choices').hide(); // label text
  }

  $('.add-choice').click(function (e) {
    const choice_value = $('#choice').val();

    if (choice_value.trim().length > 0) {
      $('.choices-list').append(generateAppendedChoices(choice_value));
    }

    li_count = $('.choices-list').children().length;
    if (li_count > 0) {
      $('.please-add-choices').hide();
      enableSubmit();
    }
  });

  $(document).on('click', '.choice-delete-button', function (e) {
    const _id = $(this).attr('id');
    $('#li-' + _id).remove();

    li_count = $('.choices-list').children().length;
    if (li_count < 1) {
      disableSubmit();
      $('.please-add-choices').show(); // label text
    } else {
      enableSubmit();
    }
  });
});

$(document).ready(function () {
  $('#attr-table').DataTable({
    ajax: {
      url: '/api/attributes',
      dataSrc: ''
    },
    order: [[0, 'desc']],
    columns: [
      { data: 'id' },
      { data: 'name' },
      { data: 'type' },
      { data: 'slug' },
      { data: 'groups_count' },
      { data: 'labels_count' },
      { data: 'choices_count' },
      { data: 'created_at' }
    ],
    columnDefs: [
      {
        targets: [7],
        render: function (data, type, row) {
          return data ? moment(data).format('DD-MM-YYYY HH:MM A') : null;
        }
      }
    ]
  });

  $('#attr-table tbody').on('click', 'tr', function () {
    const table = $('#attr-table').DataTable();

    const data = table.row(this).data();

    const drawCell = (d) => {
      console.log('data sent ', d);
      if (typeof d === 'object') {
        let output = '';
        for (k in d) {
          output += `
          <div class="p-2">
          <a href="/groups" class="bg-nex p-1 text-white rounded">${
            d[k] || ''
          }</a>
          </div>
        `;
        }
        return output;
      } else {
        return `${d || '-'}`;
      }
    };

    for (const key in data) {
      console.log('data', data);
      if (typeof data[key] !== 'undefined' && data[key]) {
        $('.nex-modal-show').slideDown(300);

        $('.nex-modal-show table').append(`
          <tr class="border border-gray-200 px-4">
            <td class="w-1/3 border h-12 text-nex font-bold">
            ${key.toLocaleUpperCase().replace('_', ' ')}
            </td>
            <td class="h-12">${drawCell(data[key])}</td>
          </tr>
      `);
      }
    }
  });

  //click outside modal
  $(document).mouseup(function (e) {
    var container = $('.nex-modal-show');

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      $('.nex-modal-show table').empty();
      container.slideUp(300);
    }
  });
});
