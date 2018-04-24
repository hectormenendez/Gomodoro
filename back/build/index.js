"use strict";

var _todoistJs = _interopRequireDefault(require("todoist-js"));

var _config = require("../config.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const todoist = new _todoistJs.default(_config.todoist.token);
todoist.completed.get_stats().then(stats => console.log(stats));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9obWVuZW5kZXovU291cmNlL2V0b3IvR29tb2Rvcm8vYmFjay9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsidG9kb2lzdCIsInRva2VuIiwiY29tcGxldGVkIiwiZ2V0X3N0YXRzIiwidGhlbiIsInN0YXRzIiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7OztBQUVBLE1BQU1BLFVBQVUsdUJBQVksZ0JBQU9DLEtBQW5CLENBQWhCO0FBRUFELFFBQVFFLFNBQVIsQ0FBa0JDLFNBQWxCLEdBQThCQyxJQUE5QixDQUFtQ0MsU0FBU0MsUUFBUUMsR0FBUixDQUFZRixLQUFaLENBQTVDIiwiZmlsZSI6Ii9Vc2Vycy9obWVuZW5kZXovU291cmNlL2V0b3IvR29tb2Rvcm8vYmFjay9zcmMvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVG9kb2lzdCBmcm9tICd0b2RvaXN0LWpzJztcbmltcG9ydCB7IHRvZG9pc3QgYXMgQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzb24nO1xuXG5jb25zdCB0b2RvaXN0ID0gbmV3IFRvZG9pc3QoQ29uZmlnLnRva2VuKTtcblxudG9kb2lzdC5jb21wbGV0ZWQuZ2V0X3N0YXRzKCkudGhlbihzdGF0cyA9PiBjb25zb2xlLmxvZyhzdGF0cykpO1xuIl19