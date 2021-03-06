import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import AppBar from './Appbar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Redirect } from 'react-router';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    padding: theme.spacing(0, 3),
  },
  paper: {
    maxWidth: 400,
    margin: `${theme.spacing(1)}px auto`,
    padding: theme.spacing(2),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function Display(props) {
  const classes = useStyles();
  const [goJobs, setGoJobs] = useState(false);
  const [goHome, setGoHome] = useState(false);
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(true)
  const { id } = useParams();

  const dropJob = function () {
    setGoJobs(true)
    axios.put(
      `/jobs/`,
      {
        params: {
          id: id,
          dropJob: true
        }
      }, { withCredentials: true }
    )
      .then(() => {

      })
      .catch(err => console.log("dropJob error: ", err));
  }

  const acceptJob = function (jobId) {
    axios.put(
      `/jobs/`,
      {
        params: {
          id: jobId,
          dropJob: false,
        }
      }, { withCredentials: true }
    )
      .then(
        (res) => {
          props.updateMyJobs();
          props.updateAllJobs();

        }
      )
      .catch(err => console.log("acceptJob error: ", err))
  }

  const markComplete = function () {
    axios.put(
      `/jobs/`,
      {
        params: {
          id: id,
          markComplete: true
        }
      }, { withCredentials: true }
    )
      .catch(err => console.log("markComplete error: ", err));
  }

  const jobStatus = function (job) {
    if (job.is_deleted) {
      return "Deleted"
    } else if (job.jobber_id === null) {
      return "Open"
    } else if (job.jobber_id !== null && job.jobber_confirm === false && job.user_confirm === false) {
      return "In Progress"
    } else if (job.jobber_confirm === true && job.user_confirm === false) {
      return "Marked Complete. Awaiting User Confirmation"
    } else if (job.jobber_confirm === true && job.user_confirm === true) {
      return "Completed"
    }
  }

  useEffect(() => {
    axios.get(`/jobs?id=${id}`, { withCredentials: true })
      .then((res) => {
        setResponse(res.data[0])
        if (props.change) {
          props.finished()
        }
      })
      .catch(err => console.log("Error fetching job: ", err));

    axios.get('/auth', { withCredentials: true })
      .then((response) => {
        if (response.data.result !== "jobber") {
          props.history.replace("/")
          props.history.go()
        } else {
          setLoading(false)
        }
      });
  }, [props.update, props.change])


  return loading ? null :
    (goHome ? <Redirect to="/jobber/" /> :
      (goJobs ? <Redirect to="/jobs/" /> :
        <MuiThemeProvider>
          <AppBar title="Job Details" user={true} jobber={true} />

          <Paper className={classes.paper}>
            <Grid item>
              <Typography variant="h4">{response.service_type}</Typography>

              <Typography>Description: {response.description}</Typography>
              <Typography>Requested By: {response.name}</Typography>
              <Typography>Address: {response.street_address}</Typography>
              <Typography>Payout: ${response.hourly_rate * response.time_estimate}</Typography>
              <Typography>Status: {jobStatus(response)}</Typography>
            </Grid>
          </Paper>
          <Grid container
            direction="column"
            justify="space-between"
            style={{ height: "60vh" }}>
            <Grid
              container
              direction="row"
              justify="space-around">
              {
                jobStatus(response) === "Open" ?
                  <section style={styles.buttonsContainer}>
                    <Button
                      onClick={() => setGoHome(true)}
                      style={styles.button}
                      variant="contained"
                      color="primary"
                    >
                      Home
                  </Button>
                    <Button
                      onClick={() => {
                        acceptJob(id)
                        props.updateMyJobs()
                        props.updateAllJobs()
                      }}
                      style={styles.button}
                      variant="contained"
                    >
                      Accept
                </Button>
                  </section>
                  : null
              }
              {
                jobStatus(response) === "In Progress" ?
                  <section style={styles.buttonsContainer}>
                    <Button
                      onClick={() => setGoHome(true)}
                      style={styles.button}
                      variant="contained"
                      color="primary"
                    >
                      Home
                  </Button>

                    <Button
                      onClick={() => {
                        markComplete()
                        props.updateMyJobs()
                        props.updateAllJobs()
                      }}
                      style={styles.complete}
                      variant="contained"
                    >
                      Mark Complete
                </Button>
                    <Button
                      onClick={() => {
                        dropJob()
                        props.updateMyJobs()
                        props.updateAllJobs()
                        setTimeout(() => {
                          props.updateMyJobs()
                          props.updateAllJobs()

                        }, 1000)
                      }}
                      style={styles.button}
                      variant="contained"
                      color="secondary"
                    >
                      Drop Job
                </Button>
                  </section>
                  : null
              }
              {
                jobStatus(response) === "Completed" || jobStatus(response) === "Marked Complete. Awaiting User Confirmation"?
                  <section style={styles.buttonsContainer}>
                    <Button
                      onClick={() => setGoHome(true)}
                      style={styles.button}
                      variant="contained"
                      color="primary"
                    >
                      Home
                  </Button>
                  </section>
                  : null
              }
            </Grid>

          </Grid>
        </MuiThemeProvider >
      )
    )
}

const styles = {
  button: {
    margin: 15
  },
  complete: {
    margin: 15,
    backgroundColor: '#28a745',
    color: 'white'
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "space-around"
  }
}