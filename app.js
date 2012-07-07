var phantom = require('phantom'),
     fs = require('fs');

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'livescore'
});

function proccess_match_sql(m){

      conn.query('SELECT id FROM matches WHERE id= ?', m.id,  function(err, rows) {
                               

          if(rows.length > 0){
               conn.query('UPDATE matches SET ? WHERE id="'+m.id+'"', m, function(err, rows) {
               
            //console.log(q.sql);
              });
          }else{
            conn.query('INSERT INTO matches SET ?', m, function(err, rows) {
               
              }); 
          }

        });


}

function fetchResults() {
conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'livescore'
});
conn.connect();

  phantom.create(function(ph) {
    return ph.createPage(function(page) {
      page.userAgent = "Mozilla/5.001 (windows; U; NT4.0; en-US; rv:1.0) Gecko/25250101";
      return page.open("http://www.rezultati.com/iframe/sport.php?sport=soccer&category=0&serial=403", function(status) {
        console.log("opened site? ", status);         
              
              page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
                  //jQuery Loaded.
                  //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.  

                  setTimeout(function() {
                    //fail
                      return page.evaluate(function() {
                        

                          //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                          var leaguesArr = [],
                          matchesArr = [],
                          i=0;

                          $('.soccer').each(function() {
                              leaguesArr.push(
                                {
                                  id:  $(this).find('.league').attr('id'),
                                  name:$(this).find('.country .name').html()
                                });

                              league = $(this).find('.league').attr('id');

                              $(this).find('tbody tr').each(function() {

                                matchesArr.push({
                                        id   : $(this).attr('id'),
                                        team_home: $(this).find('.team-home').text(), 
                                        team_away: $(this).find('.team-away').text(),
                                        time : $(this).find('.time').text(),
                                        timer: $(this).find('.timer').text(),
                                        score: $(this).find('.score').text(),
                                        league_id:league

                                      });

                              });
                              i++;
                          });
                          

   
                          return  matchesArr;

                          
                      }, function(r) {
                       
                        var m = null;

                        for (var i = 0; i < r.length; i++) {
                        m = r[i];
                         
                         proccess_match_sql(m);

                        }
                        conn.end();
                        ph.exit();
                        setTimeout(fetchResults, 60000);
                        
                      });
                  }, 5000);
   
              });
      });
      });
  });

}

fetchResults();



