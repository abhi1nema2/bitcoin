import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { IconButton, TableSortLabel } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';

const useStyles = makeStyles({
  tableContainer: {
    maxWidth: 800,
    margin: 'auto'
  },
  table: {
    minWidth: 400,
    marginTop: '10px'
  },
  name: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  coinType: {
    fontSize: '10px',
    color: 'grey'
  },
  link: {
    textDecoration: 'none',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: '10px'
  }
});

function percentageChangePrice(lastPrice, yesPrice) {
  if(yesPrice === 0) {
    return 0.00;
  }
  return ((lastPrice - yesPrice) * 100 / yesPrice).toFixed(2);
}

export default function BasicTable({ filterText }) {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filteredData, setFilteredData] = useState([]);
  const [favList, setFavList] = useState(() => {
    const localFav = window.localStorage.getItem('fav');
    return localFav !== null ? JSON.parse(localFav) : {}
  });

  useEffect(() => {
    (async function() {
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
      console.log(finalData);
      setData(finalData);
      setFilteredData(finalData);
    })();
  }, []);

  useEffect(() => {
    if(filterText === '') {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((item) => item.coinName.toLowerCase().includes(filterText.toLowerCase()) || item?.coinType?.toLowerCase().includes(filterText.toLowerCase()))
      );
    }
  }, [filterText, data]);

  const createSortHandler = (type) => {
    setOrderBy(type);
    const sortDate = [...filteredData];

    if(type === 'price') {
      sortDate.sort((a, b) => order === 'asc' ? a.last_traded_price - b.last_traded_price : b.last_traded_price - a.last_traded_price);
    }

    if(type === 'volume') {
      sortDate.sort((a, b) => {
        const x = a?.volume?.volume?.toFixed(a.tradeFloatPlaces) || 0;
        const y = b?.volume?.volume?.toFixed(b.tradeFloatPlaces) || 0;
        return order === 'asc' ? x - y : y - x;
      });
    }

    if(type === 'percent') {
      sortDate.sort((a, b) => {
        const x = percentageChangePrice(a.last_traded_price, a.yes_price);
        const y = percentageChangePrice(b.last_traded_price, b.yes_price);
        return order === 'asc' ? x - y : y - x;
      });
    }

    setOrder((prev) => prev === 'asc' ? 'desc' : 'asc');
    setFilteredData(sortDate);
  }

  const setFav = (key) => {
    if(favList[key]) {
      setFavList((prev) => {
        const newObj = { ...prev };
        newObj[key] = !favList[key];
        window.localStorage.setItem('fav', JSON.stringify(newObj));
        return newObj
      });
    } else {
      setFavList((prev) => {
        const newObj = { ...prev };
        newObj[key] = true;
        window.localStorage.setItem('fav', JSON.stringify(newObj));
        return newObj
      });
    }
  }

  return (
    <TableContainer className={classes.tableContainer} component={Paper} variant="outlined">
      <Table className={classes.table} aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            <TableCell>Coins</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'price'}
                direction={orderBy === 'price' ? order : 'asc'}
                onClick={() => createSortHandler('price')}
              >
              Price
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'volume'}
                direction={orderBy === 'volume' ? order : 'asc'}
                onClick={() => createSortHandler('volume')}
              >
              Volume
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'percent'}
                direction={orderBy === 'percent' ? order : 'asc'}
                onClick={() => createSortHandler('percent')}
              >
              24H %
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              Favourite
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row) => (
            <TableRow key={row.coinName + row.coinId}>
              <TableCell component="th" scope="row" className={classes.name}>
                <a href={`/detail/${row.coinId}`} className={classes.link}>
                  <Avatar alt={row.coinName} src={row.coinIcon} />
                  <span>{row.coinName}</span>
                  <span className={classes.coinType}>{row?.coinType?.toUpperCase()}</span>
                </a>
              </TableCell>
              <TableCell align="right">{row.last_traded_price}</TableCell>
              <TableCell align="right">{row?.volume?.volume?.toFixed(row.tradeFloatPlaces) || 0}</TableCell>
              <TableCell align="right">{percentageChangePrice(row.last_traded_price, row.yes_price)}</TableCell>
              <TableCell align="right">
              <IconButton aria-label="delete" onClick={() => setFav(row.coinName + row.coinId)}>
                {favList[row.coinName + row.coinId] ? <StarIcon /> : <StarOutlineIcon /> }
              </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}