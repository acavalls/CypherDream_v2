import React, { Component } from 'react';
import classes from './Home.module.css';
import manImg from '../../man.jpg';
import joinRevolutionImg from '../../join_rev.jpg';
import dna from '../../dna.jpg';

class Home extends Component {

    render() {

        let message = 

          <React.Fragment>

            <section>
                <div>
                  <h1 className={classes.hometitle}>
                    <strong> THE BACKBONE OF DIGITAL BIOLOGY IS HERE </strong>
                  </h1>
                  <img src={manImg}
                    class="d-block img-fluid"
                    className={classes.man}
                    alt="" />
                </div>
            </section>

            <section className={classes.whatIsCypherDream}>
              <div class="container">
                <div class="row">
                  <div class="col text-center py-5">
                    <h1 className={classes.fontTitle}>What is CypherDream?</h1>
                  </div>
                  <div className={classes.fontContent}>
                    <p> CypherDream is a biological data sharing and scientific services
                    platform that aims to become the catalyst of the upcoming personalized medicine revolution.
                    </p>
                    <p>
                      The platform combines the power of blockchain, IPFS and client-side browser data encryption giving the users
                      total control over their datasets decryption keys.
                    </p>
                    <p>
                      The system is a completely decentralized peer-to-peer network. It will be available in different devices 
                      (PCs, mobile, tablets...) and operating systems (Windows, Linux, Mac) in any modern web browser.
                    </p>
                  </div>
                  <div class="col text-center py-5">
                    <a href="/tutorial" class="btn btn-outline-light font-weight-bold"> Go to tutorial!</a>
                  </div>    
                </div>
              </div>
            </section>

            <section className={classes.positioning}>
              <img src={dna}
                class="d-block img-fluid"
                className={classes.carouselImg}
                alt="">
              </img>
              <p className={classes.marketplaceTitle}> Buy biological data </p>

              <div class="col text-right pr-3 pb-3">
                <a href="/profile"
                  class="btn btn-outline-primary font-weight-bold mr-1"
                > Profile </a>
                <a href="/marketplace"
                  class="btn btn-outline-primary font-weight-bold"
                > Marketplace </a>
              </div>
            </section>

            <section className={classes.positioning}>
              <img src={joinRevolutionImg}
                   class="d-block img-fluid"
                   className={classes.image}
                   alt="" />
              <h2 className={classes.spacer}> JOIN THE REVOLUTION </h2>
            </section>

      </React.Fragment>

        return (
          <div>
            {message}
          </div>
        )}
    }
                
export default Home;