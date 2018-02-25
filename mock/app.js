
document.querySelectorAll('.menu-group-title').forEach(el => {
  el.addEventListener('click', () => {
    // console.log('el', el.classList, 'el.nextElementSibling', el.nextElementSibling)
    el.classList.toggle('open')
    // el.nextElementSibling.classList.toggle('open')
  })
})

var itemIndex = -1
var menuItems = document.querySelectorAll('.menu-item')
menuItems.forEach((el, index) => {
  el.addEventListener('click', () => {
    if (itemIndex > -1) menuItems[itemIndex].classList.remove('open')
    el.classList.add('open')
    itemIndex = index
  })
})

document.querySelector('.app-humberger').addEventListener('click', () => {
  document.querySelector('.app-menu').classList.toggle('hide')
})



var data = getData();
var rowsCount = data.length;

var hot = Handsontable(document.getElementById('hot'), {
  data: data,
  height: (23 /* px */ * 24 /* rows */ + 30),
  colWidths: 105,
  minCols: 10,
  minRows: 24,
  // rowHeaders: true,
  colHeaders: [
    'Task',
    'Owner',
    'Team',
    'Status',
    'Start date',
    'End date',
    'At risk',
    '% complete'
  ],
  columnSorting: true,
  filters: true,
  dropdownMenu: true,
  contextMenu: true,
  autoRowSize: true,
  manualColumnMove: true,
  manualRowMove: true,
  fillHandle: {
    autoInsertRow: false,
  },
  cells: function(row, column) {
    var cellMeta = {};

    if (row >= rowsCount) {
      return cellMeta;
    }

    if (column === 1) {
      cellMeta.type = 'dropdown';
      cellMeta.source = [
        'Ben',
        'Chris',
        'Jessica',
        'Kate',
        'Michael',
        'Monica',
        'Omar',
        'Paul',
        'Samuel',
      ];

    } else if (column === 2) {
      cellMeta.readOnly = true;
      cellMeta.type = 'text';
      cellMeta.renderer = function(hotInstance, TD, row, col, prop, value) {
        var colors = {
          Red: '#e87677',
          Green: '#66e100',
          Blue: '#00a7fe',
          Purple: '#6623e2',
          Orange: '#ffad24',
          Yellow: '#ffe300',
        };

        TD.style.color = colors[value];
        TD.textContent = value;
      };

    } else if (column === 3) {
      cellMeta.type = 'dropdown';
      cellMeta.source = [
        'New',
        'Accepted',
        'Rejected',
        'In progress',
        'Completed',
      ];

    } else if (column === 4 || column === 5) {
      cellMeta.type = 'date';
      cellMeta.dateFormat = 'DD/MM/YYYY';

    } else if (column === 6) {
      var isChecked = this.instance.getDataAtCell(this.instance.toVisualRow(row), column);

      cellMeta.type = 'checkbox';
      cellMeta.className = 'htCenter' + (isChecked ? ' at-risk-checked' : '');

    } else if (column === 7) {
      cellMeta.width = 110;
      cellMeta.renderer = function(hotInstance, TD, row, col, prop, value, cellProperties) {
        var progressBar = document.createElement('progress');

        value = parseInt(value, 10);

        progressBar.max = 100;
        progressBar.value = isNaN(value) ? 0 : value;

        TD.textContent = '';
        TD.appendChild(progressBar);
      };
    }

    return cellMeta;
  },
  // Create virtual column data ("Team" column)
  modifyData: function(row, column, valueHolder, ioMode) {
    if (this.toPhysicalColumn(column) === 2 && ioMode === 'get') {
      valueHolder.value = getOwnerTeam(this.getDataAtCell(this.toVisualRow(row), this.toVisualColumn(1)));
    }
  }
});

function getOwnerTeam(owner) {
  var teamOwners = {
    Red: ['Michael', 'Ben'],
    Green: ['Omar', 'Samuel'],
    Blue: ['Kate', 'Monica'],
    Purple: ['Chris'],
    Orange: ['Paul'],
    Yellow: ['Jessica'],
  };

  return Object.keys(teamOwners).reduce(function(acc, team) {
    return teamOwners[team].indexOf(owner) !== -1 ? team : acc;
  }, null);
}
function getData() {
  return [
    [
      'Task 33',
      'Michael',
      '',
      'New',
      '',
      '',
      false,
      0
    ],
    [
      'Task 12',
      'Samuel',
      '',
      'New',
      '',
      '',
      false,
      0
    ],
    [
      'Task 96',
      'Kate',
      '',
      'Accepted',
      '',
      '',
      false,
      0
    ],
    [
      'Task 16',
      'Chris',
      '',
      'Accepted',
      '',
      '',
      false,
      0
    ],
    [
      'Task 19',
      'Samuel',
      '',
      'In progress',
      '24/01/2017',
      '15/05/2017',
      false,
      0
    ],
    [
      'Task 29',
      'Omar',
      '',
      'In progress',
      '24/01/2017',
      '13/06/2017',
      true,
      10
    ],
    [
      'Task 92',
      'Ben',
      '',
      'In progress',
      '26/01/2017',
      '20/04/2017',
      false,
      40
    ],
    [
      'Task 02',
      'Omar',
      '',
      'In progress',
      '26/01/2017',
      '05/02/2017',
      false,
      50
    ],
    [
      'Task 88',
      'Monica',
      '',
      'In progress',
      '26/01/2017',
      '15/02/2017',
      false,
      70
    ],
    [
      'Task 89',
      'Samuel',
      '',
      'In progress',
      '01/02/2017',
      '07/03/2017',
      false,
      40
    ],
    [
      'Task 26',
      'Paul',
      '',
      'In progress',
      '01/02/2017',
      '22/04/2017',
      true,
      20
    ],
    [
      'Task 56',
      'Jessica',
      '',
      'In progress',
      '01/02/2017',
      '11/05/2017',
      true,
      30
    ],
    [
      'Task 06',
      'Michael',
      '',
      'In progress',
      '01/02/2017',
      '06/06/2017',
      true,
      7
    ],
    [
      'Task 01',
      'Chris',
      '',
      'Completed',
      '05/02/2017',
      '12/02/2017',
      false,
      100
    ],
    [
      'Task 09',
      'Samuel',
      '',
      'Completed',
      '06/02/2017',
      '20/02/2017',
      false,
      100
    ],
    [
      'Task 14',
      'Michael',
      '',
      'Completed',
      '06/02/2017',
      '30/03/2017',
      false,
      100
    ],
    [
      'Task 20',
      'Paul',
      '',
      'Completed',
      '07/02/2017',
      '09/02/2017',
      false,
      100
    ],
    [
      'Task 04',
      'Ben',
      '',
      'Completed',
      '08/02/2017',
      '04/04/2017',
      false,
      100
    ],
    [
      'Task 33',
      'Samuel',
      '',
      'Rejected',
      '',
      '',
      false,
      0
    ],
    [
      'Task 79',
      'Kate',
      '',
      'Rejected',
      '',
      '',
      false,
      0
    ],
  ];
};