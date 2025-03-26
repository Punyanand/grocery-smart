import React from "react";
import { 
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Collapse,
  IconButton,
  Chip
} from "@mui/material";
import { ExpandMore, ExpandLess, LocationOn } from "@mui/icons-material";
import { useState } from "react";

const StoreComparisonCard = ({ comparisons }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (productName) => {
    setExpandedItems(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  if (!comparisons.items || comparisons.items.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No comparison data available
      </Typography>
    );
  }

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;
    return `${distance} miles away`;
  };

  return (
    <Paper elevation={0} sx={{ bgcolor: '#1e1e1e' }}>
      <List sx={{ width: '100%', bgcolor: '#1e1e1e' }}>
        {comparisons.items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton onClick={() => toggleExpand(item.product)}>
                  {expandedItems[item.product] ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
                </IconButton>
              }
              sx={{ 
                bgcolor: '#1e1e1e',
                '&:hover': { bgcolor: '#2d2d2d' }
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                    {item.product}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" sx={{ color: '#e0e0e0' }}>
                      Best Price: ${Number(item.bestPrice).toFixed(2)} at {item.bestStore}
                    </Typography>
                    {item.bestStoreDistance && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                        <LocationOn fontSize="small" sx={{ color: '#90caf9' }} />
                        <Typography component="span" variant="body2" sx={{ color: '#bdbdbd' }}>
                          {formatDistance(item.bestStoreDistance)}
                        </Typography>
                      </Box>
                    )}
                    <Typography component="span" variant="body2" sx={{ color: '#4caf50', display: 'block', mt: 0.5 }}>
                      Potential Savings: ${Number(item.savings).toFixed(2)}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            
            <Collapse in={expandedItems[item.product]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: '#2d2d2d' }}>
                {item.allPrices && item.allPrices.map(([store, price, distance], priceIndex) => (
                  <ListItem key={priceIndex} sx={{ pl: 4, py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                            {store}: ${Number(price).toFixed(2)}
                          </Typography>
                          {distance && (
                            <Chip
                              size="small"
                              icon={<LocationOn fontSize="small" sx={{ color: '#90caf9' }} />}
                              label={formatDistance(distance)}
                              variant="outlined"
                              sx={{ 
                                borderColor: '#666',
                                color: '#bdbdbd',
                                '& .MuiChip-icon': { color: '#90caf9' }
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
            
            {index < comparisons.items.length - 1 && <Divider component="li" sx={{ borderColor: '#333' }} />}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ 
        mt: 3, 
        p: 2, 
        bgcolor: '#2d2d2d', 
        color: '#ffffff',
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #333'
      }}>
        <Typography variant="h6" sx={{ color: '#ffffff' }}>
          Total Best Price:
        </Typography>
        <Typography variant="h6" sx={{ color: '#4caf50' }}>
          ${Number(comparisons.totalBestPrice).toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StoreComparisonCard;
