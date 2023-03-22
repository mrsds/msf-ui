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
import showdown from "showdown";
import { MarkdownPage } from "_core/components/Reusables";
import MiscUtil from "_core/utils/MiscUtil";
import displayStyles from "_core/styles/display.scss";

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
        this.state = {
            faqOpen: false
        };
    }

    componentDidMount() {
        this.props.completeInitialLoad();
    }

    render() {
        const faqStyle = MiscUtil.generateStringFromSet({
            [styles.faq]: true,
            [styles.only_first]: !this.state.faqOpen
        });

        const faqButtonStyle = MiscUtil.generateStringFromSet({
            [displayStyles.hidden]: this.state.faqOpen
        });

        return (
            <MuiThemeProvider theme={theme}>
                <LoadingContainerExtended />
                <div className={styles.container}>
                    <div className={styles.hero_banner}>
                        <div className={styles.banner_shader} />

                        <div className={styles.hero_controls}>
                            <div className={styles.brand_area}>
                                <div className={styles.brand1}>
                                    <a
                                        href="http://www.nasa.gov"
                                        className={styles.nasa_logo}
                                        title="Link to NASA home"
                                    />
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
                                    alt="NASA Logo"
                                    className={styles.print_logo}
                                    src="img/logo_nasa_trio_white.png"
                                />
                            </div>

                            <Typography className={styles.title} color="textSecondary" gutterBottom>
                                <br />
                                Greenhouse Gas Mapping
                            </Typography>
                            <div className={styles.section_hero}>
                                These interactive maps will help you explore methane point source
                                data.
                            </div>
                            <div className={styles.map_button_container}>
                                <a href="https://earth.jpl.nasa.gov/emit/data/data-portal/Greenhouse-Gases/">
                                    <Button
                                        size="small"
                                        variant="raised"
                                        color="primary"
                                        className={styles.map_button}
                                    >
                                        EMIT VISIONS
                                    </Button>
                                </a>
                                <Link to="./map">
                                    <Button
                                        size="small"
                                        variant="raised"
                                        color="primary"
                                        className={styles.map_button}
                                    >
                                        Methane Source Finder
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <Card className={styles.card}>
                        <CardContent className={styles.card_content}>
                            <div className={styles.left}>
                                <div className={styles.section_body}>
                                    Carbon dioxide and methane are the two dominant anthropogenic
                                    climate-forcing agents. Because the methane lifetime in the
                                    atmosphere is only about a decade, and methane is more efficient
                                    at trapping radiation than carbon dioxide on a molecular basis,
                                    targeting reductions in anthropogenic methane emissions offers
                                    an effective approach to decrease overall atmospheric radiative
                                    forcing. Methane and carbon dioxide have distinct absorption
                                    features in the shortwave infrared (1900&ndash;2500 nm) that
                                    permits mapping of point source greenhouse gas emissions with
                                    imaging spectrometers that were developed at JPL, like{" "}
                                    <a href="https://aviris.jpl.nasa.gov/">AVIRIS</a>,{" "}
                                    <a href="https://avirisng.jpl.nasa.gov/greenhouse_gas_mapping.html">
                                        AVIRIS-NG
                                    </a>,{" "}
                                    <a href="https://doi.org/10.1109/AERO53065.2022.9843565">
                                        AVIRIS-3
                                    </a>, and <a href="https://earth.jpl.nasa.gov/emit/">EMIT</a>.
                                    Future NASA missions like the Surface Biology and Geology (<a href="https://sbg.jpl.nasa.gov/">
                                        SBG
                                    </a>) Designated Observable will have methane and carbon dioxide
                                    sensitivity.
                                </div>
                                <div className={styles.section_body}>
                                    Using these instruments, methane and carbon dioxide plumes can
                                    be mapped at high spatial resolution and emission sources
                                    located and attributed to specific emission sectors like oil &
                                    gas or waste management. The use of quantitative gas retrieval
                                    algorithms permits quantification of methane and carbon dioxide
                                    emission rates. Identifying strong emission sources offers the
                                    potential to constrain regional greenhouse gas budgets, improve
                                    partitioning between anthropogenic and natural emission sources,
                                    and to mitigate emissions. A list of publications that utilize
                                    imaging spectrometers for greenhouse gas mapping is provided
                                    below.
                                </div>
                                <div className={styles.section_body}>
                                    <Typography
                                        className={styles.section_title}
                                        color="default"
                                        gutterBottom
                                    >
                                        Greenhouse gas mapping tools
                                    </Typography>
                                    JPL is using data from AVIRIS-NG and EMIT to visualize point
                                    sources of greenhouse gas emissions.
                                </div>

                                <div className={styles.section_body}>
                                    The Methane Source Finder web portal was developed to visualize
                                    methane plumes observed with the Airborne Visible Infrared
                                    Imaging Spectrometer - Next Generation (AVIRIS-NG) and includes
                                    data from airborne campaigns between 2016 and 2019.
                                </div>

                                <div className={styles.section_body}>
                                    Methane plumes observed with the Earth Surface Mineral Dust Source
                                    Investigation (EMIT) instrument, currently operating on the
                                    International Space Station, are visualized using the{" "}
                                    <a href="https://earth.jpl.nasa.gov/emit/data/data-portal/Greenhouse-Gases/">
                                        EMIT VISIONS Open Data Portal
                                    </a>. This mapping effort aligns with the Open Science and Open Data
                                    policy and is part of NASA&#8217;s contribution to a federated US
                                    Government Greenhouse Gas (GHG) information system.
                                </div>

                                <div className={styles.image_container}>
                                    <img
                                        alt="Four examples of methane plumes observed with AVIRIS and EMIT"
                                        className={styles.app_screenshot}
                                        src="img/4panel_landfill_annotated.png"
                                    />
                                </div>

                                <div className={styles.section_body}>
                                    The graphic above shows methane plumes observed with AVIRIS for the
                                    Aliso Canyon gas storage blowout in 2015 (upper left), for an oil &
                                    gas source in the Permian Basin using AVIRIS-NG (upper right), from
                                    a landfill observed with EMIT (lower left), and power plant carbon
                                    dioxide plumes observed with EMIT (lower right).
                                </div>

                                <div className={styles.section_body}>
                                    <Typography
                                        className={styles.section_title}
                                        color="default"
                                        gutterBottom
                                    >
                                        Publications
                                    </Typography>
                                    <Typography
                                        className={styles.subsection_title}
                                        color="default"
                                        gutterBottom
                                    >
                                        JPL imaging spectrometers
                                    </Typography>

                                    <div className={styles.publication_list}>
                                        Green, R.O., Schaepman, M.E., Mouroulis, P., Geier, S., Shaw,
                                        L., Hueini, A., Bernas, M., McKinley, I., Smith, C., Wehbe, R.
                                        and Eastwood, M., 2022, March. Airborne Visible/Infrared Imaging
                                        Spectrometer 3 (AVIRIS-3). In 2022 IEEE Aerospace Conference
                                        (AERO) (pp. 1-10). IEEE.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Bradley, C.L., Thingvold, E., Moore, L.B., Haag, J.M., Raouf,
                                        N.A., Mouroulis, P. and Green, R.O., 2020, August. Optical
                                        design of the earth surface mineral dust source investigation
                                        (EMIT) imaging spectrometer. In Imaging Spectrometry XXIV:
                                        Applications, Sensors, and Processing (Vol. 11504, p. 1150402).
                                        SPIE.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Hamlin, L., Green, R.O., Mouroulis, P., Eastwood, M., Wilson,
                                        D., Dudik, M. and Paine, C., 2011, March. Imaging spectrometer
                                        science measurements for terrestrial ecology: AVIRIS and new
                                        developments. In 2011 Aerospace conference (pp. 1-7). IEEE.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Green, R.O., Eastwood, M.L., Sarture, C.M., Chrien, T.G.,
                                        Aronsson, M., Chippendale, B.J., Faust, J.A., Pavri, B.E.,
                                        Chovit, C.J., Solis, M. and Olah, M.R., 1998. Imaging
                                        spectroscopy and the airborne visible/infrared imaging
                                        spectrometer (AVIRIS). Remote sensing of environment, 65(3),
                                        pp.227-248.
                                    </div>
                                </div>

                                <div className={styles.section_body}>
                                    <Typography
                                        className={styles.subsection_title}
                                        color="default"
                                        gutterBottom
                                    >
                                        Greenhouse gas mapping using JPL imaging spectrometers
                                    </Typography>

                                    <div className={styles.publication_list}>
                                        Yu, J., Hmiel, B., Lyon, D.R., Warren, J., Yu, J., Cusworth,
                                        D.H., Duren, R.M., submitted. Empirical Quantification of
                                        Methane Emission Intensity from Oil and Gas Producers in the
                                        Permian Basin. Environmental Science & Technology Letters.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A. K., Kort, E. A., Duren, R. M., Cusworth, D. H.,
                                        Herner, J., Falk, M., Lozo, C.J., Langfitt, Q., Wilhelm, S. F.,
                                        Eggers, R., Bue, B. D., Yadav, V., Ayasse, A. K., Thompson, D.
                                        R., Green, R. O., Miller, C. E., Frankenberg, C., in review.
                                        Methane emissions decline from reduced oil, natural gas, and
                                        refinery production during COVID-19.
                                    </div>

                                    <div className={styles.publication_list}>
                                        B.M. Conrad, D.R. Tyner, M.R. Johnson, in review. Robust
                                        Probabilities of Detection and Quantification Uncertainty for
                                        Aerial Methane Detection: Examples for Three Airborne
                                        Technologies, Remote Sensing of Environment.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Erland, B.M., Adams, C.., Thorpe, A.K., Gamon, J.A., 2022.
                                        Recent Advances Towards Transparent Methane Emissions
                                        Monitoring: A Review. Environmental Science & Technology.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Erland, B.M., Adams, C., Darlington, A., Smith, M.L., Thorpe,
                                        A.K., Wentworth, G.R., Conley, S., Liggio, J., Li, S.M., Miller,
                                        C.E. and Gamon, J.A., 2022. Comparing airborne algorithms for
                                        greenhouse gas flux measurements over the Alberta oil sands.
                                        Atmospheric Measurement Techniques, 15(19), pp.5841-5859.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Jacob, D.J., Varon, D.J., Cusworth, D.H., Dennison, P.E.,
                                        Frankenberg, C., Gautam, R., Guanter, L., Kelley, J., McKeever,
                                        J., Ott, L.E. and Poulter, B., 2022. Quantifying methane
                                        emissions from the global scale down to point sources using
                                        satellite observations of atmospheric methane. Atmospheric
                                        Chemistry and Physics Discussions, pp.1-44.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Yu, J., Hmiel, B., Lyon, D.R., Warren, J., Cusworth, D.H.,
                                        Duren, R.M., Chen, Y., Murphy, E.C. and Brandt, A.R., 2022.
                                        Methane Emissions from Natural Gas Gathering Pipelines in the
                                        Permian Basin. Environmental Science & Technology Letters.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Cusworth, D.H., 2022, Thorpe, A.K., Ayasse, A.K., Stepp, D.,
                                        Heckler, J., Asner, G.P., Miller, C.E., Chapman, J. W.,
                                        Eastwood, M.L., Green, R.O., Hmiel, B., Lyon, D., Duren, R.M.,
                                        2022. Strong methane point sources contribute a disproportionate
                                        fraction of total emissions across multiple basins in the U.S.
                                        https://doi.org/10.31223/X53P88
                                    </div>

                                    <div className={styles.publication_list}>
                                        Ayasse, A.K., Thorpe, A.K., Cusworth, D.H., Kort, E.A., Negron,
                                        A.G., Heckler, J., Asner, G. and Duren, R.M., 2022. Methane
                                        remote sensing and emission quantification of offshore shallow
                                        water oil and gas platforms in the Gulf of Mexico. Environmental
                                        Research Letters, 17(8), p.084039.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Jongaramrungruang, S., Thorpe, A.K., Matheou, G. and
                                        Frankenberg, C., 2022. MethaNet–An AI-driven approach to
                                        quantifying methane point-source emission from high-resolution
                                        2-D plume imagery. Remote Sensing of Environment, 269, p.112809.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Jongaramrungruang, S., Matheou, G., Thorpe, A.K., Zeng, Z.C. and
                                        Frankenberg, C., 2021. Remote sensing of methane plumes:
                                        instrument tradeoff analysis for detecting and quantifying local
                                        sources at global scale. Atmospheric Measurement Techniques,
                                        14(12), pp.7999-8017.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Foote, M.D., Dennison, P.E., Sullivan, P.R., O'Neill, K.B.,
                                        Thorpe, A.K., Thompson, D.R., Cusworth, D.H., Duren, R. and
                                        Joshi, S.C., 2021. Impact of scene-specific enhancement spectra
                                        on matched filter greenhouse gas retrievals from imaging
                                        spectroscopy. Remote Sensing of Environment, 264, p.112574.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A.K., O'Handley, C., Emmitt, G.D., DeCola, P.L.,
                                        Hopkins, F.M., Yadav, V., Guha, A., Newman, S., Herner, J.D.,
                                        Falk, M. and Duren, R.M., 2021. Improved methane emission
                                        estimates using AVIRIS-NG and an Airborne Doppler Wind Lidar.
                                        Remote Sensing of Environment, 266, p.112681.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Cusworth, D.H., Duren, R.M., Thorpe, A.K., Olson-Duvall, W.,
                                        Heckler, J., Chapman, J.W., Eastwood, M.L., Helmlinger, M.C.,
                                        Green, R.O., Asner, G.P. and Dennison, P.E., 2021. Intermittency
                                        of Large Methane Emitters in the Permian Basin. Environmental
                                        Science & Technology Letters.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Irakulis-Loitxate, I., Guanter, L., Liu, Y.N., Varon, D.J.,
                                        Maasakkers, J.D., Zhang, Y., Chulakadabba, A., Wofsy, S.C.,
                                        Thorpe, A.K., Duren, R.M. and Frankenberg, C., 2021.
                                        Satellite-based survey of extreme methane emissions in the
                                        Permian basin. Science Advances, 7(27), p.eabf4507.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Cusworth, D.H., Duren, R.M., Thorpe, A.K., Eastwood, M.L.,
                                        Green, R.O., Dennison, P.E., Frankenberg, C., Heckler, J.W.,
                                        Asner, G.P. and Miller, C.E., 2021. Quantifying global power
                                        plant carbon dioxide emissions with imaging spectroscopy. AGU
                                        Advances, 2(2), p.e2020AV000350.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Elder, C.D., Thompson, D.R., Thorpe, A.K., Chandanpurkar, H.A.,
                                        Hanke, P.J., Hasson, N., James, S.R., Minsley, B.J., Pastick,
                                        N.J., Olefeldt, D. and Walter Anthony, K.M., 2021.
                                        Characterizing methane emission hotspots from thawing
                                        permafrost. Global Biogeochemical Cycles, 35(12),
                                        p.e2020GB006922.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Cusworth, D.H., Duren, R.M., Thorpe, A.K, Miller, C.E., Pandey,
                                        S., Maasakkers, J.D., Aben, I., Jervis, D., Varon, D., Jacob,
                                        D.J., Randles, C.R., Smith, M., Gautam, R., Omara, M., Schade,
                                        G., Dennison, P.E., Frankenberg, C., Gordon, D., Lopinto, E.
                                        (2020c). Multi-satellite imaging of a gas well blowout enables
                                        quantification of total methane emissions. Geophysical Research
                                        Letters, p.e2020GL090864.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Borchardt, J., Gerilowski, K., Krautwurst, S., Bovensmann, H.,
                                        Thorpe, A.K., Thompson, D.R., Frankenberg, C., Miller, C.E.,
                                        Duren, R.M. and Burrows, J.P. (2020). Detection and
                                        quantification of CH4 plumes using the WFM-DOAS retrieval on
                                        AVIRIS-NG hyperspectral data. Atmospheric Measurement
                                        Techniques.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Cusworth, D.H., Duren, R.M., Thorpe, A.K., Tseng, E., Thompson,
                                        D.R., Guha, A., Newman, S., Foster, K., Miller, C.E. (2020b).
                                        Using remote sensing to detect, validate, and quantify methane
                                        emissions from California solid waste operations. Environmental
                                        Research Letters, 15(5), 054012.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Cusworth, D.H., Duren, R.M., Yadav, V., Thorpe, A.K., Verhulst,
                                        K., Sander, S., Hopkins, F., Rafiq, T. and Miller, C.E. (2020a).
                                        Synthesis of Methane Observations Across Scales: Strategies for
                                        Deploying a Multitiered Observing Network. Geophysical Research
                                        Letters, 47(7), p.e2020GL087869.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Elder, C.D., Thompson, D.R., Thorpe, A.K., Hanke, P., Walter
                                        Anthony, K.M. and Miller, C.E. (2020). Airborne Mapping Reveals
                                        Emergent Power Law of Arctic Methane Emissions. Geophysical
                                        Research Letters, 47(3), p.e2019GL085707.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Foote, M.D., Dennison, P.E., Thorpe, A.K., Thompson, D.R.,
                                        Jongaramrungruang, S., Frankenberg, C., Joshi, S.C. (2020). Fast
                                        and accurate retrieval of point-source methane emissions from
                                        imaging spectrometer data using sparsity prior. IEEE
                                        Transactions on Geoscience and Remote Sensing, 58, 6480-6492.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Guha, A., Newman, S., Fairley, D., Dinh, T.M., Duca, L., Conley,
                                        S., Smith, M.L., Thorpe, A., Duren, R.M., Cusworth, D. and
                                        Foster, K. (2020). Assessment of Regional Methane Emissions
                                        Inventories through Airborne Quantification in the San Francisco
                                        Bay Area. Environmental Science & Technology.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Rafiq, T., Duren, R.M., Thorpe, A.K., Foster, K, Patarsuk, R.,
                                        Mille, C.E., Hopkins, F.M. (2020). Attribution of Methane Point
                                        Source Emissions using Airborne Imaging Spectroscopy and the
                                        Vista-California Methane Infrastructure Dataset. Environmental
                                        Research Letters.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A.K., Duren, R., Conley, S., Prasad, K., Bue, B., Yadav,
                                        V., Foster, K., Rafiq, T., Hopkins, F., Smith, M. and Fischer,
                                        M.L. (2020). Methane emissions from underground gas storage in
                                        California. Environmental Research Letters, 15(4), 045005.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Ayasse, A.K., Dennison, P.E., Foote, M., Thorpe, A.K., Joshi,
                                        S., Green, R.O., Duren, R.M., Thompson, D.R. and Roberts, D.A.
                                        (2019). Methane Mapping with Future Satellite Imaging
                                        Spectrometers. Remote Sensing, 11(24), p.3054.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Cusworth, D.H., Jacob, D.J., Varon, D.J., Miller, C.C., Lu, X.,
                                        Chance, K., Thorpe, A.K., Duren, R.M., Miller, C.E.,
                                        Frankenberg, C., Randles, C.A. (2019). Potential of
                                        next-generation imaging spectrometers to detect and quantify
                                        methane point sources from space. Atmospheric Measurement
                                        Techniques.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Duren, R.M., Thorpe, A.K., Foster, K., Rafiq, T., Hopkins, F.M.,
                                        Yadav, V., Bue, B.D., Conley, S., Colombi, N., McCubbin, I.,
                                        Frankenberg, C., Thompson, D.R., Falk, M., Herner, J., Croes,
                                        B., Green, R.O., Miller, C.E. (2019). California’s methane
                                        super-emitters. Nature.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Jongaramrungruang, S., Frankenberg, C., Matheou, G., Thorpe,
                                        A.K., Kuai, L., Thompson, D.R., Duren, R. M. (2019). Towards
                                        accurate methane point-source quantification using high spatial
                                        resolution spatial methane mapping. Atmospheric Measurement
                                        Techniques.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thompson, D.R., Guanter, L., Berk, A. et al. Retrieval of
                                        Atmospheric Parameters and Surface Reflectance from Visible and
                                        Shortwave Infrared Imaging Spectroscopy Data. Surv Geophys 40,
                                        333–360 (2019). https://doi.org/10.1007/s10712-018-9488-9.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Ayasse, A.K., Thorpe, A.K., Roberts, D.A., Funk, C.C., Dennison,
                                        P.E., Frankenberg, C., Steffke, A., Aubrey, A.D. (2018).
                                        Evaluating the effects of surface properties on methane
                                        retrievals using a synthetic Airborne Visible/Infrared Imaging
                                        Spectrometer Next Generation (AVIRIS-NG) image. Remote Sensing
                                        of Environment, 215, 386-397.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Krautwurst, S., Gerilowski, K., Jonsson, H.H., Thompson, D.R.,
                                        Kolyer, R.W., Iraci, L.T., Thorpe, A.K., Horstjann, M.,
                                        Eastwood, M., Leifer, I., Vigil, S.A. (2017). Methane emissions
                                        from a Californian landfill, determined from airborne remote
                                        sensing and in situ measurements. Atmospheric Measurement
                                        Techniques, 10(9), 3429.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A.K., Frankenberg, C., Thompson, D.R., Duren, R.M.,
                                        Aubrey, A.D., Bue, B.D., Green, R.O., Gerilowski, K., Krings,
                                        T., Borchardt, J., Kort, E.A. (2017). Airborne DOAS retrievals
                                        of methane, carbon dioxide, and water vapor concentrations at
                                        high spatial resolution: Application to AVIRIS-NG. Atmospheric
                                        Measurement Techniques, 10(10), 3833.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Frankenberg, C., Thorpe, A.K., Thompson, D.R., Hulley, G., Kort,
                                        E.A., Vance, N., Borchardt, J., Krings, T., Gerilowski, K.,
                                        Sweeney, C., Conley, S. (2016). Airborne methane remote
                                        measurements reveal heavy-tail flux distribution in Four Corners
                                        region. Proceedings of the National Academy of Sciences,
                                        201605617.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thompson, D.R., Thorpe, A.K., Frankenberg, C., Green, R.O.,
                                        Duren, R., Guanter, L., Hollstein, A., Middleton, E., Ong, L.,
                                        Ungar, S. (2016). Space‐based remote imaging spectroscopy of the
                                        Aliso Canyon CH4 superemitter. Geophysical Research Letters,
                                        43(12), 6571-6578.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A.K., Frankenberg, C., Roberts, et al. (2016a). Mapping
                                        methane concentrations from a controlled release experiment
                                        using the next generation Airborne Visible/Infrared Imaging
                                        Spectrometer (AVIRIS-NG). Remote Sensing of Environment, 179,
                                        104-115.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A. K., Frankenberg, C., Green, R. O., Thompson, D. R.,
                                        Mouroulis, P., Eastwood, M.L., Matheou, G. (2016b). The Airborne
                                        Methane Plume Spectrometer (AMPS): Quantitative imaging of
                                        methane plumes in real time, paper presented at Aerospace
                                        Conference, 2016 IEEE.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Aubrey, A.D., Frankenberg, C., Green, R.O., Eastwood, M.L.,
                                        Thompson, D.R., Thorpe, A.K. (2015). Crosscutting airborne
                                        remote sensing technologies for oil and gas and earth science
                                        applications, paper presented at Offshore Technology Conference,
                                        Houston, Texas. Thompson, D.R., Leifer, I., Bovensmann, H.,
                                        Eastwood, M.L., Green, R.O., Eastwood, M.L., Fladeland, M.,
                                        Frankenberg, C., Gerilowski, K., Green, R.O., Kratwurst, S.,
                                        Krings, T., Luna, B., Thorpe, A.K. (2015). Real time remote
                                        detection and measurement for airborne imaging spectroscopy: A
                                        case study with methane. Atmospheric Measurement Techniques, 8,
                                        4383-4397.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A.K., Frankenberg, C., Roberts, D.A. (2014). Retrieval
                                        techniques for airborne imaging of methane concentrations using
                                        high spatial and moderate spectral resolution: Application to
                                        AVIRIS. Atmospheric Measurement Techniques, 7, 491-506.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Dennison, P.E., Thorpe, A.K., Qi, Y., Roberts, D.A., Green, R.O.
                                        (2013a). Modeling sensitivity of imaging spectrometer data to
                                        carbon dioxide and methane plumes. Proc. Workshop on
                                        Hyperspectral Image and Signal Processing: Evolution in Remote
                                        Sensing (WHISPERS).
                                    </div>

                                    <div className={styles.publication_list}>
                                        Dennison, P.E., Thorpe, A.K., Qi, Y., Roberts, D.A., Green,
                                        R.O., Bradley, E.S., Funk, C.C. (2013b). High spatial resolution
                                        mapping of elevated atmospheric carbon dioxide using airborne
                                        imaging spectroscopy: Radiative transfer modeling and power
                                        plant plume detection. Remote Sensing of Environment, 139,
                                        116–129.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A.K., Roberts, D.A., Bradley, E.S., Funk, C.C.,
                                        Dennison, P.E., Leifer I. (2013). High resolution mapping of
                                        methane emissions from marine and terrestrial sources using a
                                        Cluster-Tuned Matched Filter technique and imaging spectrometry.
                                        Remote Sensing of Environment, 134, 305–318.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Thorpe, A.K., Roberts, D.A., Dennison, P.E., Bradley, E.S.,
                                        Funk, C.C. (2012). Point source emissions mapping using the
                                        Airborne Visible/Infrared Imaging Spectrometer (AVIRIS). Proc.
                                        SPIE, 8390, 839013.
                                    </div>

                                    <div className={styles.publication_list}>
                                        Bradley, E.S., Leifer, I., Roberts, D.A., Dennison, P.E. and
                                        Washburn, L., 2011. Detection of marine methane emissions with
                                        AVIRIS band ratios. Geophysical Research Letters, 38(10).
                                    </div>

                                    <div className={styles.publication_list}>
                                        Roberts, D.A., Bradley, E.S., Cheung, R., Leifer, I., Dennison,
                                        P.E. and Margolis, J.S., 2010. Mapping methane emissions from a
                                        marine geological seep source using imaging spectrometry. Remote
                                        Sensing of Environment, 114(3), pp.592-606.
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className={styles.footer}>
                        <div className={styles.footer_nav}>
                            <ul>
                                <li>
                                    <a href="http://www.nasa.gov/">NASA</a>
                                </li>
                                |
                                <li>
                                    <a href="http://www.caltech.edu/">Caltech</a>
                                </li>
                                |
                                <li>
                                    <a href="http://jpl.nasa.gov/copyrights.php">Privacy</a>
                                </li>
                                |
                                <li>
                                    <a href="http://jpl.nasa.gov/imagepolicy">Image Policy</a>
                                </li>
                                |
                                <li>
                                    <a href="http://jpl.nasa.gov/faq.php">FAQ</a>
                                </li>
                                |
                                <li>
                                    <a href="http://jpl.nasa.gov/contact_JPL.php">Feedback</a>
                                </li>
                            </ul>
                        </div>
                        <div className={styles.div_footer_right}>
                            Site Contact: <a href="mailto:msf@jpl.nasa.gov">Andrew Thorpe</a>
                            <br />
                            Release number: URS280411, URS298327
                        </div>
                        <script
                            id="_fed_an_ua_tag"
                            type="text/javascript"
                            src="https://dap.digitalgov.gov/Universal-Federated-Analytics-Min.js?agency=NASA&subagency=METHANE-MAPPER&dclink=true&sp=search,s,q&sdor=false&exts=tif,tiff"
                        />
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
