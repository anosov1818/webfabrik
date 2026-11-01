const mobileNavTrigger = document.querySelector( '.menu-wrapper' );

if ( mobileNavTrigger ) {

    mobileNavTrigger.addEventListener( "click", function( e ) {

        mobileNavTrigger.classList.toggle( '_active' );
    })

}