/*eslint-env browser*/

function getSemesters(callback) {
  var domXhr = new XMLHttpRequest
  domXhr.open("GET", "/d2l/api/lp/1.15/enrollments/myenrollments/?orgUnitTypeId=5")
  domXhr.onload = function (e) {
    if (domXhr.status == 200) {
      callback(null, JSON.parse(domXhr.response).Items)
    } else {
      callback(e, null)
    }
  }
  domXhr.send()
}

function getDomain() {
  var domains = document.getElementsByName('domain')
  for (var i = 0; i < domains.length; i++) {
    if (domains[i].checked) {
      return (domains[i].id)
    }
  }
}


function filterSemesters(err, semesters) {
  var domain = getDomain()
  console.log(semesters)
  console.log("Selected Domain: " + domain)
  updateList(semesters)
}

function updateList(semesters) {
  var stringList = ""
  semesters.forEach(function (each) {
    stringList += "<option value='" + each.OrgUnit.Id + "'>" + each.OrgUnit.Name + "</option>"
  })
  document.getElementById('semesterList').disabled = false
  document.getElementById('semesterList').innerHTML = stringList
}


function updateSemesters() {
  getSemesters(filterSemesters)
}

/*Get List of (All) Courses*/
function getCourses() {
  /* Show loading info */
  document.getElementById('courseContainer').insertAdjacentHTML('beforeend', "<p id='loadingNotice'>Loaded page <span id='pageNum'></span></p>")

  var semesterId = document.getElementById('semesterList').value
  var courses = [];
  var bookmark = null;
  var morePages = true;
  var pageNum = 0;
  async.whilst(
    function () {
      return morePages == true;
    },
    function (callback) {
      var url = "/d2l/api/lp/1.15/enrollments/myenrollments/?orgUnitTypeId=3"
      if (bookmark !== null) {
        url += "&Bookmark=" + bookmark;
      }

      var semesterXhr = new XMLHttpRequest
      semesterXhr.open("GET", url)
      semesterXhr.onload = function (e) {
        if (semesterXhr.status == 200) {
          pageNum++
          document.getElementById('pageNum').innerHTML = pageNum;
          var response = JSON.parse(semesterXhr.response)
          morePages = response.PagingInfo.HasMoreItems;
          bookmark = response.PagingInfo.Bookmark;
          courses.push.apply(courses, response.Items)
        } else {
          console.error(e)
        }
        callback(null, courses);
      }
      semesterXhr.send();
    },
    displayCourses
  );
}


function displayCourses(e, courses) {
  /*Hide loading info*/
  var notice = document.getElementById('loadingNotice')
  notice.parentElement.removeChild(notice)
  console.log(courses)
  var source = document.getElementById("course-display").innerHTML
  var template = Handlebars.compile(source);
  var html

  courses.forEach(function (each) {
    var context = {
      courseOu: each.OrgUnit.Id,
      courseName: each.OrgUnit.Name
    }
    html = template(context)
    document.getElementById('courseContainer').insertAdjacentHTML('beforeend', html);
  })
}
