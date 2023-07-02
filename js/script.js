/*
 File: script.js
 Assignment: Scrabble Game
 Bikash Shrestha, UMass Lowell Computer Science, Bikash_Shrestha@student.uml.edu
 Copyright (c) 2023 by Bikash Shrestha. All rights reserved. May be
 freely copied or excerpted for educational purposes with credit to the
 author.
 Updated by BS on July 1,  2023, at 8:00 PM.
 Instructor: Professor Wenjin Zhou
 Help: w3 Schools/ Stack Overflow / jQuery / Google 
 Basic Description: This is the fifth assignment where we use jQuery UI, HTML, and CSS to create a game of Scrabble. The assigngment mostly focues on the drag-and-drop method. 
*/

// Constant for the maximum number of tiles in the rack 
const RACK_MAX_TILES = 7;
var totalScore = 0;

$(document).ready(function() {
    // Creating scrabble object and initializing the game
    ObjScrabble.init();

    // Initialize the custom board with different tile types
    var $blank = $('<div>').addClass('board-blank slot droppable ui-widget-header')
                           .attr('letter-mult', 1)
                           .attr('word-mult', 1);
    var $doublew = $blank.clone()
                         .addClass('board-double-word')
                         .removeClass('board-blank')
                         .attr('word-mult', 2);
    var $doublel = $blank.clone()
                         .addClass('board-double-letter')
                         .removeClass('board-blank')
                         .attr('letter-mult', 2);
    var i = 0;
    $('#board')
        .append($blank.clone().attr('col', i++))
        .append($doublew.clone().attr('col', i++))
        .append($blank.clone().attr('col', i++))
        .append($doublel.clone().attr('col', i++))
        .append($blank.clone().attr('col', i++))
        .append($doublew.clone().attr('col', i++))
        .append($blank.clone().attr('col', i++));

    // Draw tiles to rack 
    drawHand();
    // Refresh Scoreboard 
    refreshScoreboard();
    // Enable tile dragging functionality
    makeTilesDraggable();

   // Allow the dropping of tiles into the board slots
    $('.slot').droppable({
        tolerance: 'intersect',
        hoverClass: 'drop-hover',
        drop: function (event, ui) {
            var $this = $(this);
            if ( $this.children().length == 0 ) {
                ui.draggable
                    .detach()
                    .css({top: 0, left: 0})
                    .addClass('drawn')
                    .appendTo($this);
                refreshScoreboard();
                $('#next-word').prop('disabled', false);
            }
        }
    });

   // Allow the dropping of tiles back into the rack
    $('#rack').droppable({
        accept: '.drawn',
        tolerance: 'intersect',
        hoverClass: 'drop-hover',
        drop: function (e, ui) {
            ui.draggable.detach()
                        .removeClass('drawn')
                        .css({top:0, left:0})
                        .appendTo($(this));
            refreshScoreboard();
        }
    });

    // Event handler for the reset button
    $('#reset').on('click', function(e) {
        e.preventDefault();
        ObjScrabble.init();
        $('#board').children().empty();
        $('#rack').empty();
        drawHand();
        makeTilesDraggable();
        refreshScoreboard();
        totalScore = 0;
        $('#total-score').text(totalScore);
    })

    // Event handler for the next word button
    $('#next-word').on('click', function(e) {
        e.preventDefault();
        $('#board').children().empty();
        drawHand();
        makeTilesDraggable();
        var curScore = parseInt($('#cur-score').text(), 10);
        totalScore += curScore;
        $('#total-score').text(totalScore);
        refreshScoreboard();
    });

});

// Refreshes the scoreboard based on the current tiles on the board
function refreshScoreboard() {
    var stringWord = "";
    var score = 0;
    var letterVal;
    var letterMult = 1;
    var wordMult = 1;

    // For each drawn tile, calculate its value based on the tile itself and the board slot in which it resides. 
    $('.slot').each(function() {
        var $this = $(this);
        var $child;
        if ( $this.children().length > 0 ) {
            $child = $this.find('img');
            stringWord += $child.attr('letter');

            letterVal = parseInt($child.attr('value'), 10);
            letterMult = parseInt($this.attr('letter-mult'), 10);

            score += (letterVal * letterMult);
            wordMult *= parseInt($this.attr('word-mult'), 10);
        } else {
            stringWord += '.';
        }

    });

   // Write out values to the scoreboard elements
    $('#word').text(stringWord);
    $('#cur-score').text(score*wordMult);
    $('#bag').text(ObjScrabble.bag.length);

}

// Draws tiles from the bag to fill the player's hand with 7 tiles
function drawHand() {
    var $rack = $('#rack');
    var $tile = $('<img>').addClass('tile draggable ui-widget-content');
    var i = $rack.children().length;
    for (; i < RACK_MAX_TILES; ++i) {
        var key = ObjScrabble.drawTileFromBag();
        if (key) {
            var strSrc = 'images/tiles/Scrabble_Tile_' + key + '.jpg';
            var $newTile = $tile.clone()
                                .attr('value', ObjScrabble.dictTiles[key].value)
                                .attr('letter', key)
                                .attr('src', strSrc)
                                .appendTo('#rack');
        }
    }
}

// Enables the tiles to be draggable
function makeTilesDraggable() {
    $('.tile').draggable({
        revert: true,
        revertDuration: 500, // Animation speed for tiles to return to their original spot
        scroll: false,
        start: function (e, ui) {
            $(this).addClass('hovering');
        },
        stop: function (e, ui) {
            $(this).removeClass('hovering');
        }
    });
}

// Determines whether debugging mode is enabled
var debugging = false;
// Scrabble object containing tile dictionary, bag, and initialization function
var ObjScrabble = {};
ObjScrabble.dictTiles = [];

// Initializes the Scrabble object with the tile dictionary and bag
ObjScrabble.init = function() {
    // Tile dictionary with letter values, frequencies, and quantities
    // dictionary from:  https://jesseheines.com/~heines/91.461/91.461-2015-16f/461-assn/Scrabble_Pieces_AssociativeArray_Jesse_Test.html 
    ObjScrabble.dictTiles['A'] = { 'value': 1,  'freq' : 9,  'quantity' : 9 };
    ObjScrabble.dictTiles['B'] = { 'value': 3,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['C'] = { 'value': 3,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['D'] = { 'value': 2,  'freq' : 4,  'quantity' : 4 };
    ObjScrabble.dictTiles['E'] = { 'value': 1,  'freq' : 12, 'quantity' : 12};
    ObjScrabble.dictTiles['F'] = { 'value': 4,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['G'] = { 'value': 2,  'freq' : 3,  'quantity' : 3 };
    ObjScrabble.dictTiles['H'] = { 'value': 4,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['I'] = { 'value': 1,  'freq' : 9,  'quantity' : 9 };
    ObjScrabble.dictTiles['J'] = { 'value': 8,  'freq' : 1,  'quantity' : 1 };
    ObjScrabble.dictTiles['K'] = { 'value': 5,  'freq' : 1,  'quantity' : 1 };
    ObjScrabble.dictTiles['L'] = { 'value': 1,  'freq' : 4,  'quantity' : 4 };
    ObjScrabble.dictTiles['M'] = { 'value': 3,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['N'] = { 'value': 1,  'freq' : 6,  'quantity' : 6 };
    ObjScrabble.dictTiles['O'] = { 'value': 1,  'freq' : 8,  'quantity' : 8 };
    ObjScrabble.dictTiles['P'] = { 'value': 3,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['Q'] = { 'value': 10, 'freq' : 1,  'quantity' : 1 };
    ObjScrabble.dictTiles['R'] = { 'value': 1,  'freq' : 6,  'quantity' : 6 };
    ObjScrabble.dictTiles['S'] = { 'value': 1,  'freq' : 4,  'quantity' : 4 };
    ObjScrabble.dictTiles['T'] = { 'value': 1,  'freq' : 6,  'quantity' : 6 };
    ObjScrabble.dictTiles['U'] = { 'value': 1,  'freq' : 4,  'quantity' : 4 };
    ObjScrabble.dictTiles['V'] = { 'value': 4,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['W'] = { 'value': 4,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['X'] = { 'value': 8,  'freq' : 1,  'quantity' : 1 };
    ObjScrabble.dictTiles['Y'] = { 'value': 4,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.dictTiles['Z'] = { 'value': 10, 'freq' : 1,  'quantity' : 1 };
    ObjScrabble.dictTiles['_'] = { 'value': 0,  'freq' : 2,  'quantity' : 2 };
    ObjScrabble.size = Object.keys(ObjScrabble.dictTiles).length;

    // If debugging mode is enabled, log the size of the tile dictionary
    if (debugging) console.log('ObjScrabble.size: ', ObjScrabble.size);

    // Setting up the bag by populating it with tiles based on the dictionary
    ObjScrabble.bag = [];
    for (var key in ObjScrabble.dictTiles) {
        for (var i = 0; i < ObjScrabble.dictTiles[key].quantity; ++i) {
            ObjScrabble.bag.push( key );
        }
    }

    // If debugging mode is enabled, log the bag length and its contents
    if (debugging) {
        console.log('bag.length: ', ObjScrabble.bag.length);
        console.log(ObjScrabble.bag);
    }
}

// Returns a random letter from the bag
ObjScrabble.drawTileFromBag = function () {
    if (this.bag.length < 1)
        return null;

    // Get a random index within the range of the bag length
    var randIndex = Math.floor( Math.random() * this.bag.length );
    // Remove the letter at the random index from the bag
    var strLetter = this.bag.splice( randIndex, 1 );
    // Decrement the quantity of the letter in the dictionary
    this.dictTiles[strLetter].quantity--;

    // If debugging mode is enabled, log the remaining quantity of the letter
    if (debugging)
        console.log(strLetter + ' : ' + this.dictTiles[strLetter].quantity);
    return strLetter;
}