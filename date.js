exports.getDate = function(){
  var today = new Date();
  var options = {
    weekday : "long",
    day : "numeric",
    month : "long"
  };
  var day = today.toLocaleDateString("en-us",options);
  return day;
}
