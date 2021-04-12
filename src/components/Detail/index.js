import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Avatar, CardHeader } from '@material-ui/core';

const useStyles = makeStyles({
  cointainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px'
  },
  root: {
    minWidth: 400,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function Detail({ data }) {
  let { id } = useParams();
  const [detail, setDetail] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    async function getData() {
      const fetchApi = await fetch('https://bitbns.com/jugApi/coinParams.json');
      const response = await fetchApi.json();
      const resObj = response[0].data[0];

      const tickerApi = await fetch('https://bitbns.com/order/getTickerWithVolume');
      const tickerResponse = await tickerApi.json();
      const finalData = Object.keys(tickerResponse).reduce((acc, curr) => {
        if(!resObj[curr.toLowerCase()] || !tickerResponse[curr]) {
          return acc;
        }
        return [ ...acc, { ...resObj[curr.toLowerCase()], ...tickerResponse[curr] }];
      }, []);
      const details = finalData.find((item => item.coinId === Number(id)));
      if(details) {
        setDetail(details);
      }
    };
    if(data) {
      setDetail(data);
    } else {
      getData();
    }
  }, [data, id]);
  console.log(detail);

  return (
    <>
      {detail ? <div className={classes.cointainer}>
        <Card className={classes.root} variant="outlined">
        <CardHeader
        avatar={
          <Avatar alt={detail.coinName} src={detail.coinIcon} />
        }
        title={detail.coinName}
        subheader={detail?.coinType?.toUpperCase()}
        />
        <CardContent>
          <Typography variant="body2" component="p">
            Price: {detail.last_traded_price}
          </Typography>
          <Typography variant="body2" component="p">
            Highest buy bid: {detail.highest_buy_bid}
          </Typography>
          <Typography variant="body2" component="p">
            Lowest sell bid: {detail.lowest_sell_bid}
          </Typography>
          <Typography variant="body2" component="p">
            Withdrawal Fee: {detail.withdrawalFee}
          </Typography>
          <Typography variant="body2" component="p">
            Volume: {detail?.volume?.volume || 0}
          </Typography>
          <Typography variant="body2" component="p">
            Minimum Deposit: {detail.minDeposit}
          </Typography>
          <Typography variant="body2" component="p">
            Minimum MTrade Amount: {detail.minMTradeAmt}
          </Typography>
          
        </CardContent>
        {detail.hashLink && <CardActions>
          <Button size="small" href={detail.hashLink}>Learn More</Button>
        </CardActions>}
      </Card>
      </div> : <div>No Coin Found with this ID</div> }
    </>
  );
}