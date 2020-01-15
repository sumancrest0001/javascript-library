// BUDGET controller
let budgetController = (function(){
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }

  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };


  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(current){
       sum += current.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    precentage: -1
  };

  return {
    addItem: function(type, des, val){
      var newItem, ID;
      // Create new ID
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else if (data.allItems[type].length === 0)
      {
        ID = 0;
      }
      // Create new item based on the type of inputs (expense or income).
      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
      }else if (type === 'inc'){
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id){
      var ids, index;
      // id = 3
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1){
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function(){
      // calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');
      // calculate total budget: income - expenses

      data.budget = data.totals.inc - data.totals.exp;
      // calculate percentage of income that was spent
      if(data.totals.inc > 0) {
          data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
     calculatePercentages: function(){
       data.allItems.exp.forEach(function(current){
         current.calcPercentage(data.totals.inc);
       });
     },

     getPercentages: function(){
       var allPerc = data.allItems.exp.map(function(current){
         return current.getPercentage();
       });
       return allPerc;
     },

    getBudget: function() {
      // returning data related to total budgets
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data);
    }
  };
})();




//UI controller
var UIController = (function(){
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentagesLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber= function(num, type){
    var numSplit;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) +','+ int.substr(int.length - 3, int.length);
    }
    dec = numSplit[1];
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  return{
    getInput: function(){
      return{
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    // this function is to listout expenses and incomes in the UI
    addListItem: function(obj, type) {
      let html, newHtml, element;
      if (type === 'inc')
      { element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
       }
       else if (type === 'exp'){
         element = DOMstrings.expenseContainer;
         html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value"> %value%</div><div class="item__percentage">21 %</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div> </div>';
       }

       // Replaced the hard coded placeholders with dynamic data
       newHtml = html.replace('%id%', obj.id);
       newHtml = newHtml.replace( '%value%', formatNumber(obj.value, type));
       newHtml = newHtml.replace('%description%', obj.description);

       // Insert HTML for displaying list of expenses and incomes
       document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
   // this method clears the input fields once data are entered.
    clearFields: function(){
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc);
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp);
      if(obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages){
      var fields = document.querySelectorAll(DOMstrings.expenseLabel);
      var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
          callback(list[i], i);
        }
      };

      nodeListForEach(fields,function(current, index){
        if (percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });

    },


    displayMonth: function(){
      var now, months, month, year;
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month]+ ' '+year;
    },

    getDOMstrings: function(){
      return DOMstrings;
    }
  };
})();




let controller = (function(budgetCtrl, UICtrl){

  let setupEventListeners = function(){
    let DOM = UIController.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event){
      if (event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };

  let updateBudget = () => {
  budgetController.calculateBudget();
      // 4. Calcuate the budget
      var budget = budgetController.getBudget();
      // 5. Display the budget on the UI
      UIController.displayBudget(budget);
  };

  var updatePercentages = function(){
    budgetController.calculatePercentages();
    var percentages = budgetController.getPercentages();
    UIController.displayPercentages(percentages);
  };

  let ctrlAddItem = function(){
    let inputs, newItem;
  // 1. Get the field input data
  inputs = UIController.getInput();

  //input validation
  if (inputs.description !== "" && !isNaN(inputs.value) && inputs.value > 0) {
    // 2. Add the item to the budget controller.
    newItem = budgetController.addItem(inputs.type, inputs.description, inputs.value);
    UIController.clearFields();
    // 3. Add the item to the UI
    UIController.addListItem(newItem, inputs.type);

    //4. calculate and update budget
    updateBudget();

    updatePercentages();
  } else
  {
    alert('invalid inputs');
  }

};

let ctrlDeleteItem = function(event){
  var itemID,splitID;
  itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
  if (itemID) {
    //inc-1 if we call array methods for a string then it will automatically convert string into array and perform the action
   splitID = itemID.split('-');
   type = splitID[0];
   ID = parseInt(splitID[1]);

   // 1.delete the item from the controller
   budgetController.deleteItem(type, ID);
   // 2. delete item from the UI
   UIController.deleteListItem(itemID);
   // 3.Update and show the new budget
   updateBudget();
   updatePercentages();
  }
};

return{
  init: function(){
    UIController.displayMonth();
    UIController.displayBudget({
      budget: 0,
      totalInc: 0,
      totalExp: 0,
      percentage: -1
    });
    setupEventListeners();
  }
}

})(budgetController, UIController);


controller.init();
