#!/usr/bin/env node

const os = require( 'os' );
const fs = require( 'fs' );

const usage = `product-listing
Usage
    index.js <product-file-path> <listing-file-path> <results-file-path>
`;

if( process.argv.length < 5 ) {
    console.log( usage );
    process.exit( 2 );
}

async function doWork( productPath, listingPath, resultsPath ) {

    const pp = readFile( productPath );
    const lp = readFile( listingPath );
    const products = toObjs( await pp );
    const listings = toObjs( await lp );
    const listingIndex = createIndex( listings );
    const matches = matchUp( products, listings, listingIndex );
    await writeFile( resultsPath, matches.join( os.EOL ) );
    console.log( 'matches saved to', resultsPath );
}

function readFile( filePath ) {
    return new Promise( (resolve, reject) => {

        const callback = (err, data) => {
            if( err ) {
                reject( err );
                return;
            }
            resolve( data );
        };

        try {
            fs.readFile(
                filePath,
                { encoding: 'utf8' },
                callback
            );
        } catch( e ) {
            reject( e );
        }

    } );
}

function writeFile( filePath, contents ) {
    return new Promise( (resolve, reject) => {

        const callback = err => {
            if( err ) {
                reject( err );
                return;
            }
            resolve( true );
        };

        try {
            fs.writeFile(
                filePath,
                contents,
                { encoding: 'utf8' },
                callback
            );
        } catch( e ) {
            reject( e );
        }

    } );
}

function matchUp( products, listings, listingIndex ) {
    const matches = [];
    for( let i = 0; i < products.length; i++ ) {
        const product = products[ i ];
        const re = new RegExp( getExpression( product ), 'igm' );
        const match = {
            product_name: product.product_name,
            listings: []
        }
        let result = null;
        while( result = re.exec( listingIndex ) ) {
            const index = result[ 1 ];
            match.listings.push( listings[ index ] );
        }
        matches.push( JSON.stringify( match ) );
    }
    return matches;
}

function getExpression( product ) {
    let exp = '^(\\d+):'
    exp += escapeForExpression( product.manufacturer );
    exp += '( | \\S+ )';
    exp += escapeForExpression( product.model );
    exp += '[^\\n]*$';
    return exp;
}

function escapeForExpression( val ) {
    return val.replace( /([.?*+^$[\]\\(){}|-])/g, "\\$1" );
}

function createIndex( listings ) {

/* returns a multiline string in following format

<listing_index>:<listing_title>

e.g.

0:LED Flash Macro Ring Light (48 X LED) with 6 Adapter Rings for For Canon/Sony/Nikon/Sigma Lenses
1:Canon PowerShot SX130IS 12.1 MP Digital Camera with 12x Wide Angle Optical Image Stabilized Zoom with 3.0-Inch LCD

*/

    const elements = [];
    for( let i = 0; i < listings.length; i++ ) {
        elements.push( i + ':' + listings[ i ].title );
    }
    return elements.join( os.EOL );
}

function toObjs( raw ) {
    return raw.split( os.EOL )
        .filter( oStr => oStr )
        .map( oStr => JSON.parse( oStr ) );
}

doWork( process.argv[ 2 ], process.argv[ 3 ], process.argv[ 4 ] );