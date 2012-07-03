var phantom = require('phantom'),
     fs = require('fs');
phantom.create(function(ph) {
  return ph.createPage(function(page) {
    return page.open("http://www.rezultati.com/iframe/sport.php?sport=soccer&category=0&serial=403", function(status) {
      console.log("opened site? ", status);         
 
            page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
                //jQuery Loaded.
                //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                setTimeout(function() {
                    return page.evaluate(function() {
                        console.log("hej");
                        //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                        var leaguesArr = [],
                        matchesArr = [],
                        i=0;
                        
                        $('.soccer').each(function() {
                            leaguesArr.push($(this).find('.country .name').html());
                            $(this).find('tbody tr').each(function() {


                              matchesArr[i] = [];
                              matchesArr[i].push({
                                      team1: $(this).find('.team-home').text(), 
                                      team2: $(this).find('.team-away').text(),
                                      score: $(this).find('.score').text()
                                    });
                            });
                            i++;
                        });
                        

 
                        return {
                            leagues: leaguesArr,
                            matches: matchesArr
                        };

                        
                    }, function(result) {
                      fs.writeFile('rezultati.txt', JSON.stringify(result), function(err) {
                        if(err) throw err;
                        
                      ph.exit();
                      });
                    });
                }, 5000);
 
            });
    });
    });
});