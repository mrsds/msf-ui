import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import { LoadingContainerExtended } from "components/Loading";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { appColorPalette } from "styles/appColorPalette";
import styles from "components/LandingPage/LandingPageStyles.scss";
import * as appActionsExtended from "actions/appActionsExtended";
import { Link } from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

const theme = createMuiTheme({
    typography: {
        htmlFontSize: 10
    },
    palette: {
        primary: appColorPalette,
        secondary: appColorPalette
    }
});

export class LandingPage extends Component {
    constructor(props) {
        super(props);
        this.open = true;
    }

    componentDidMount() {
        this.props.completeInitialLoad();
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <LoadingContainerExtended />
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.brand_area}>
                            <div className={styles.brand1}>
                                <a href="http://www.nasa.gov" className={styles.nasa_logo} />
                            </div>
                            <div className={styles.brand2}>
                                <div className={styles.jpl_logo}>
                                    <a href="http://jpl.nasa.gov" className={styles.nasa_logo}>
                                        Jet Propulsion Laboratory
                                    </a>
                                </div>
                                <div className={styles.caltech_logo}>
                                    <a href="http://caltech.edu" className={styles.nasa_logo}>
                                        California Institute of Technology
                                    </a>
                                </div>
                            </div>
                            <img
                                alt=""
                                className={styles.print_logo}
                                src="img/logo_nasa_trio_white.png"
                            />
                        </div>
                    </div>
                    <div className={styles.hero_banner}>
                        <div className={styles.hero_controls}>
                            <Typography className={styles.title} color="textSecondary" gutterBottom>
                                Methane Source Finder
                            </Typography>
                            <div className={styles.map_button_container}>
                                <Link to="/map">
                                    <Button
                                        size="small"
                                        variant="raised"
                                        color="primary"
                                        className={styles.map_button}
                                    >
                                        Start Application
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <Card className={styles.card}>
                        <CardContent className={styles.card_content}>
                            <div className={styles.left}>
                                <Typography
                                    className={styles.section_title}
                                    color="default"
                                    gutterBottom
                                >
                                    ABOUT
                                </Typography>
                                <div className={styles.section_body}>
                                    Methane Source Finder helps you explore, analyze, and download
                                    methane data across a range of scales in California derived from
                                    airborne remote-sensing, surface monitoring networks and
                                    satellites on an interactive map alongside infrastructure
                                    information.
                                </div>
                                <div className={styles.section_body}>
                                    Why focus on methane? Methane (CH4) is a powerful greenhouse gas
                                    - second only to carbon dioxide as a climate-forcing agent
                                    resulting from human (anthropogenic) activity. The growth rate
                                    of methane in the atmosphere is due to a complex combination of
                                    natural and anthropogenic emissions and natural removal
                                    processes. The exact causes for observed changes in the methane
                                    growth rate over time remain uncertain due to incomplete data
                                    and disagreements between different measurement methods. Methane
                                    emissions and their causes at local and regional scales remain
                                    particularly uncertain. Additionally, methane is also being
                                    increasingly prioritized by California and other governments for
                                    near-term climate action given its relatively short atmospheric
                                    lifetime and the potential for rapid, focused mitigation that
                                    can complement economy-wide efforts to reduce carbon dioxide
                                    emissions. Methane is also a precursor for tropospheric ozone
                                    and is strongly linked with co-emitted reactive trace gases
                                    targeted by air quality and public health policies in
                                    California. Finally, methane vented to the atmosphere from leaks
                                    in natural gas infrastructure – if not promptly detected and
                                    repaired - can result in costly product loss and (in
                                    sufficiently large quantities) a combustion hazard. All of the
                                    above factors motivate the need for sharing methane data across
                                    a broad range of scales.
                                </div>
                            </div>
                            <div className={styles.right}>
                                <Typography
                                    className={styles.section_title}
                                    color="default"
                                    gutterBottom
                                >
                                    TOPIC
                                </Typography>
                                <div className={styles.section_body}>
                                    Methane Source Finder helps you explore, analyze, and download
                                    methane data across a range of scales...
                                </div>
                                <Typography
                                    className={styles.section_title}
                                    color="default"
                                    gutterBottom
                                >
                                    TOPIC 2
                                </Typography>
                                <div className={styles.section_body}>
                                    Methane Source Finder helps you explore, analyze, and download
                                    methane data across a range of scales...
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className={styles.footer}>
                        <div>Site Contact: Riley Duren</div>
                        <div>Release number: URS280411</div>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

LandingPage.propTypes = {
    completeInitialLoad: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch) {
    return {
        completeInitialLoad: bindActionCreators(
            appActionsExtended.completeLandingPageLoad,
            dispatch
        )
    };
}

export default connect(null, mapDispatchToProps)(LandingPage);