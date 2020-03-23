import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import BottomNavBar from "./BottomNavBar";
import CategoryFilter from "./CategoryFilter";
import NewsCards from "./NewsCards";
import NoResults from "./NoResults";
import SearchBar from "./SearchBar";
import Suggestions from "./Suggestions";

const styles = theme => ({
  landingPage: {
    flexGrow: 1,
    overflow: "hidden",
    alignItems: "center",
  },
  paper: {
    maxWidth: 400,
    margin: `${theme.spacing.unit}px auto`,
    padding: 0,
  },
  title: {
    textAlign: "center",
    fontFamily: "Source Sans Pro",
    color: "#084D67",
  },
});

class LandingPage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      newsCardArticles: [],
      queryResultArticles: [],
      query: "",
      error: false,
      isLoading: false,
      loadSearchedQuery: false,
      hasSearchResults: false,
      showNoResultsCard: false,
    };
  }

  setDefaultCards = e => {
    fetch("/news")
      .then(response => response.json())
      .then(response => {
        this.setState({ newsCardArticles: response });
      });
    //console.log("debug_message1");
  };

  handleChange = (indexKey, data) => {
    this.setState({ [indexKey]: data });
  };

  getInfo = async () => {
    const { query } = this.state;
    await axios
      .post("/news/filter", { query })
      .then(response => {
        const results = response.data;
        if (results.length > 0) {
          this.setState({ hasSearchResults: true, showNoResultsCard: false });
          this.setState({ queryResultArticles: results.slice(0, 5) });
        } else {
          this.setState({ hasSearchResults: false, showNoResultsCard: true });
          this.setState({ queryResultArticles: [] });
        }
      })
      .catch(() => this.setState({ error: true }));
  };

  handleInputChange = queryVal => {
    this.setState(
      {
        query: queryVal,
      },
      () => {
        if (this.state.query && this.state.query.length > 0) {
          this.getInfo();
        } else {
          this.setState({ hasSearchResults: false });
          this.clearSuggestions();
        }
      }
    );
  };

  handleSearch = queryVal => {
    this.handleInputChange(queryVal);
    this.setState({ newsCardArticles: this.state.queryResultArticles });
  };

  handleSearchClick = (e, article) => {
    e.preventDefault();
    this.clearSuggestions();
    this.setState({ newsCardArticles: [article] });
  };

  handleClearClick = () => {
    this.clearSuggestions();
  };

  clearSuggestions = () => {
    this.setState({
      query: "",
      queryResultArticles: [],
      hasSearchResults: false,
      showNoResultsCard: false,
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.landingPage}>
        <Paper className={classes.paper}>
          <Grid container direction="column">
            <Grid item xs>
              <SearchBar
                handleClearClick={this.handleClearClick}
                handleInputChange={this.handleInputChange}
                handleSearch={this.handleSearch}
                query={this.state.query}
              />
              {this.state.hasSearchResults && (
                <Suggestions
                  queryResultArticles={this.state.queryResultArticles}
                  handleSearchClick={this.handleSearchClick}
                  query={this.state.query}
                />
              )}
            </Grid>
          </Grid>
          <CategoryFilter />
          {this.state.showNoResultsCard && !this.state.hasSearchResults && (
            <Card>
              <NoResults query={this.state.query} />
            </Card>
          )}
          <Grid item xs>
            {!this.state.showNoResultsCard && (
              <NewsCards
                handleChange={this.handleChange}
                onLoad={this.setDefaultCards}
                articles={this.state.newsCardArticles}
              />
            )}
          </Grid>
          <Grid item xs>
            <BottomNavBar onLoad={this.setDefaultCards} />
          </Grid>
        </Paper>
      </div>
    );
  }
}

LandingPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LandingPage);
