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
    <Paper elevation={0} sx={{ bgcolor: 'white' }}>
      <List sx={{ width: '100%', bgcolor: 'white' }}>
        {comparisons.items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton onClick={() => toggleExpand(item.product)}>
                  {expandedItems[item.product] ? <ExpandLess sx={{ color: '#1e293b' }} /> : <ExpandMore sx={{ color: '#1e293b' }} />}
                </IconButton>
              }
              sx={{ 
                bgcolor: 'white',
                '&:hover': { bgcolor: '#f8fafc' }
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    {item.product}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" sx={{ color: '#64748b' }}>
                      Best Price: ${Number(item.bestPrice).toFixed(2)} at {item.bestStore}
                    </Typography>
                    {item.bestStoreDistance && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                        <LocationOn fontSize="small" sx={{ color: '#3b82f6' }} />
                        <Typography component="span" variant="body2" sx={{ color: '#64748b' }}>
                          {formatDistance(item.bestStoreDistance)}
                        </Typography>
                      </Box>
                    )}
                    <Typography component="span" variant="body2" sx={{ color: '#10b981', display: 'block', mt: 0.5 }}>
                      Potential Savings: ${Number(item.savings).toFixed(2)}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            
            <Collapse in={expandedItems[item.product]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: '#f8fafc' }}>
                {item.allPrices && item.allPrices.map(([store, price, distance], priceIndex) => (
                  <ListItem key={priceIndex} sx={{ pl: 4, py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {store}: ${Number(price).toFixed(2)}
                          </Typography>
                          {distance && (
                            <Chip
                              size="small"
                              icon={<LocationOn fontSize="small" sx={{ color: '#3b82f6' }} />}
                              label={formatDistance(distance)}
                              variant="outlined"
                              sx={{ 
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                '& .MuiChip-icon': { color: '#3b82f6' }
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
            
            {index < comparisons.items.length - 1 && <Divider component="li" sx={{ borderColor: '#e2e8f0' }} />}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ 
        mt: 3, 
        p: 2, 
        bgcolor: '#f8fafc', 
        color: '#1e293b',
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <Typography variant="h6" sx={{ color: '#1e293b' }}>
          Total Best Price:
        </Typography>
        <Typography variant="h6" sx={{ color: '#10b981' }}>
          ${Number(comparisons.totalBestPrice).toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StoreComparisonCard;
