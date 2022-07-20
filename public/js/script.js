function uniqArray(arr) {
  const ar = arr.filter(
    (value, index, self) =>
      index ===
      self.findIndex((t) => t.id === value.id && t.name === value.name)
  );

  return ar;
}

function generateAppendedChoices(choice_value) {
  return `<li class="my-1 inline-block p-2 py-1 border border-gray-50 rounded-md bg-gray-50" id="li-${new Date().getTime()}">${choice_value} 
  <input type="hidden" name="choices[]" value="${choice_value}" minlength="2"/>
  <button type="button" class="inline-block choice-delete-button" id="${new Date().getTime()}">X</button>
  </li>  
  `;
}

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

  if (buttonType === 'text' || buttonType === 'textarea') {
    $('#minimum').prop('type', 'Length');
    $('#maximum').prop('type', 'Length');
    $('#minimum').prop('min', '2');
    $('#minimum').prop('value', '2');
  }

  if (buttonType === 'number') {
    $('#minimum').prop('type', 'Number');
    $('#maximum').prop('type', 'Number');
    $('#minimum').prop('min', '');
    $('#minimum').prop('value', '');
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
    $('#default_label').text('Default ' + 'Email'); // label text
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

$(document).ready(function () {
  // show- modal is active to enable / disable click on table

  $('.attributes-trigger').mouseover(function () {
    $('.attributes-menu').show();
  });

  $('.attributes-trigger').mouseleave(function () {
    $('.attributes-menu').hide();
  });

  $('.attributes-menu').mouseover(function () {
    $('.attributes-menu').show();
  });

  $('.attributes-menu').mouseleave(function () {
    $('.attributes-menu').hide();
  });

  const type = $('.button-type').val();
  chooseInputType(type);

  // animate the attrs modal
  $('.create-attribute').click(function () {
    $('.edit-type').val('');
    $('.id').val('');
    $('.type-button').show();

    $('.attr-form').trigger('reset');
    $('.attr-form option').each(function (option) {
      $(this).attr('selected', false);
      $('.chosen-select').trigger('chosen:updated');
    });

    $('.choices-list').empty();
    $('.nex-modal-create').slideDown(500);
  });

  $('.close-nex-modal').click(function () {
    $('.attrs').slideUp(500);
    $('.nex-modal-create').slideUp(500);
    $('.edit-type').val('');
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

  function drawChoices() {
    let li_count = 0;

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
  }
  drawChoices();

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

  // Attributes table
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
      { data: 'labels_count' },
      { data: 'label' },
      { data: 'groups_count' },
      { data: 'choices' },
      { data: 'created_at' }
    ],
    columnDefs: [
      {
        targets: [8],
        render: function (data, type, row) {
          return data ? moment(data).format('DD-MM-YYYY h:mm A') : null;
        }
      }
    ]
  });

  $('#attr-table tbody').on('click', 'tr', function () {
    const table = $('#attr-table').DataTable();
    const data = table.row(this).data();
    window.location.href = '/attributes/' + data.id;

    // const table = $('#attr-table').DataTable();
    // const data = table.row(this).data();
    // $('.show-table-header').text('Attribute : ' + data.name);
    // const delete_url = `/attributes/${data.id}/delete`;
    // $('.edit-delete-btn')
    //   .empty()
    //   .append(
    //     `
    //   <div class="table-actions flex justify-end">
    //     <button class="bg-nex p-2 w-16 text-white m-2 rounded-md edit-button">
    //       Edit
    //     </button>
    //     <form action="${delete_url}" method="post" class="bg-red-500 p-2 w-16 text-white mx-auto my-2 rounded-md delete-attr-button">
    //       <button type="submit" onclick="return confirm('are you sure ?')">
    //         Delete
    //       </button>
    //     </form>
    //   </div>
    // `
    //   );
    // const drawCell = (k, d) => {
    //   let output = '';
    //   if (k === 'created_at' || k === 'updated_at') {
    //     output += `
    //           <div class="p-2">
    //             ${moment(d[k]).format('DD-MM-YYYY h:mm A') || 'No Data'}
    //           </div>
    //         `;
    //   } else if (typeof d === 'object') {
    //     d = uniqArray(d);
    //     output = '';
    //     d.forEach((dt) => {
    //       if (typeof dt === 'object' && parseInt(dt.id) > 0) {
    //         if (k === 'groups') {
    //           output += `
    //             <div class="p-2">
    //               <a href="/groups/${dt.id}" class="bg-nex p-1 text-white rounded">${dt.name}</a>
    //             </div>
    //           `;
    //         } else {
    //           output += `<div class="p-2 block ">`;
    //           if (dt.abbreviation) {
    //             output += `<span class="font-bold">${dt.abbreviation.toUpperCase()}</span> : `;
    //           }
    //           output += `${dt.name || '-'}</div>`;
    //         }
    //       } else output += '-';
    //     });
    //   } else {
    //     return `${d || 'No Data'}`;
    //   }
    //   return output;
    // };
    // for (const key in data) {
    //   if (typeof data[key] !== 'undefined' && data[key]) {
    //     $('.nex-modal-show').slideDown(300);
    //     $('.nex-modal-show table').append(
    //       `
    //       <tr class="border border-gray-700 px-4">
    //         <td class="w-1/3 border border-gray-700 h-12 text-nex font-bold">
    //         <strong>${key.toLocaleUpperCase().replace('_', ' ')}</strong>
    //         </td>
    //         <td class="h-12">
    //           ${drawCell(key, data[key])}
    //         </td>
    //       </tr>
    //   `
    //     );
    //   }
    // }
    // // Attr EDIT modal -- fill data
    // $('body').on('click', '.edit-button', function () {
    //   $('.id').val(data.id);
    //   $('.choices-list').empty();
    //   chooseInputType(data.type);
    //   $('.nex-modal-show ').slideUp(500);
    //   $('.nex-modal-create').slideDown(500);
    //   $('.attrs').slideDown(500);
    //   $('#name').val(data.name);
    //   $('#description').val(data.description);
    //   $('#default_value').val(data.default_value);
    //   $('#minimum').val(data.min);
    //   $('#maximum').val(data.max);
    //   $('#unit').val(data.unit);
    //   $('#default_area').val(data.default_area);
    //   if (data.required == '1') $('#required').prop('checked', true);
    //   if (typeof data.locals !== 'undefined' && Array.isArray(data.locals)) {
    //     data.locals.forEach(function (local) {
    //       $(`#${local.abbreviation}_label`).val(local.name);
    //     });
    //   }
    //   if (typeof data.groups !== 'undefined' && Array.isArray(data.groups)) {
    //     data.groups.forEach(function (group) {
    //       $(`#${group.id}-${group.name}`).attr('selected', 'selected');
    //     });
    //     $('.chosen-select').trigger('chosen:updated');
    //   }
    //   if (typeof data.choices !== 'undefined' && Array.isArray(data.choices)) {
    //     const ch = uniqArray(data.choices);
    //     ch.forEach(function (choice) {
    //       $('.choices-list').append(generateAppendedChoices(choice.name));
    //     });
    //   }
    //   $('.type-button').hide();
    //   $(`.${data.type}-button`).show();
    //   if (
    //     data.type === 'check-boxes' ||
    //     data.type === 'radio-buttons' ||
    //     data.type === 'single-select' ||
    //     data.type === 'multiple-select'
    //   ) {
    //     $('.check-boxes-button').show();
    //     $('.radio-buttons-button').show();
    //     $('.single-select-button').show();
    //     $('.multiple-select-button').show();
    //   }
    //   if (data.type === 'date' || data.type === 'datetime') {
    //     $('.date-button').show();
    //     $('.datetime-button').show();
    //   }
    //   li_count = $('.choices-list').children().length;
    //   if (li_count < 1) {
    //     disableSubmit();
    //     $('.please-add-choices').show(); // label text
    //   } else {
    //     enableSubmit();
    //   }
    // });
    // //click outside modal
    // $(document).mouseup(function (e) {
    //   var container = $('.nex-modal-show');
    //   // if the target of the click isn't the container nor a descendant of the container
    //   if (!container.is(e.target) && container.has(e.target).length === 0) {
    //     $('.nex-modal-show table').empty();
    //     container.slideUp(300);
    //   }
    // });
    // $(document).mouseup(function (e) {
    //   var container = $('.nex-modal-create');
    //   // if the target of the click isn't the container nor a descendant of the container
    //   if (!container.is(e.target) && container.has(e.target).length === 0) {
    //     container.slideUp(300);
    //   }
    // });
  });

  // Groups table
  $('#groups-table').DataTable({
    ajax: {
      url: '/api/groups',
      dataSrc: ''
    },
    order: [[0, 'desc']],
    columns: [
      { data: 'id' },
      { data: 'name' },
      { data: 'attributes_count' },
      { data: 'created_at' }
    ],
    columnDefs: [
      {
        targets: [3],
        render: function (data, type, row) {
          return data ? moment(data).format('DD-MM-YYYY h:mm A') : null;
        }
      }
    ]
  });

  $('#groups-table tbody').on('click', 'tr', function () {
    // $('.nex-modal-show').slideUp(300);
    // $('#nex-modal-create-group').slideUp(500);
    // $('.nex-modal-show table').empty();
    // const table = $('#groups-table').DataTable();
    // const data = table.row(this).data();
    // $('.show-table-header').text('Group : ' + data.name);
    // $('.nex-modal-show').append(`
    // <table>
    //   <thead>
    //     <tr>
    //       <th>Attribute id</th>
    //       <th>Attribute Name</th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     <tr>
    //       <th>Attribute id</th>
    //       <th>Attribute Name</th>
    //     </tr>
    //   </tbody>
    // </table>
    // `);
    // const delete_url = `/groups/${data.id}/delete`;
    // $('.edit-delete-btn')
    //   .empty()
    //   .append(
    //     `
    // <div class="table-actions flex justify-end">
    //   <button class="bg-nex p-2 w-16 text-white m-2 rounded-md edit-button">
    //     Edit
    //   </button>
    //   <form action="${delete_url}" method="post" class="bg-red-500 p-2 w-16 text-white mx-auto my-2 rounded-md delete-attr-button">
    //     <button type="submit" onclick="return confirm('are you sure ?')">
    //       Delete
    //     </button>
    //   </form>
    // </div>`
    //   );
    // for (const key in data) {
    //   if (typeof data[key] !== 'undefined' && data[key]) {
    //     $('.nex-modal-show').slideDown(300);
    // if (key !== 'attributes') {
    //   $('.nex-modal-show table').append(
    //     `
    //     <tr class="border border-gray-700 px-4 h-24">
    //       <td class="w-1/3 border border-gray-700 text-nex font-bold">
    //       <strong>${key.toLocaleUpperCase().replace('_', ' ')}</strong>
    //       </td>
    //       <td class="">
    //       ${
    //         key === 'created_at' || key === 'updated_at'
    //           ? moment(data[key]).format('DD-MM-YYYY h:mm A')
    //           : data[key]
    //       }
    //       </td>
    //     </tr>
    // `
    //   );
    // }
    //     if (key === 'attributes') {
    //       $('.nex-modal-show table').append(
    //         `
    //         <tr class="border border-gray-700 px-4 h-24">
    //           <td class="w-1/3 border border-gray-700 text-nex font-bold">
    //           <strong>${key.toLocaleUpperCase().replace('_', ' ')}</strong>
    //           </td>
    //           <td class="">
    //           ${data[key].map((attribute) => {
    //             if (attribute.id) {
    //               return `<button class="bg-nex rounded text-white p-2 m-2" id="show-attribute-from-group">${attribute.name}</button>`;
    //             }
    //             return '-';
    //           })}
    //           </td>
    //         </tr>
    //     `
    //       );
    //     }
    //   }
    // }
    // $('body').on('click', '.edit-button', function () {
    //   $('.nex-modal-show').slideUp(300);
    //   $('#nex-modal-create-group').slideDown(300);
    //   $('#group_id').val(data.id);
    //   $('#group_name').val(data.name);
    //   $('#group_description').val(data.description);
    // });
  });
  $('body').on('click', '#close-nex-modal-group', function () {
    $('#nex-modal-create-group').slideUp(300);
  });
  $('body').on('click', '.create-group', function () {
    $('.nex-modal-show').slideUp(300);
    $('#nex-modal-create-group').slideDown(300);
  });
});
