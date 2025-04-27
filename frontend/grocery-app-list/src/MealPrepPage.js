import React, {useState} from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import {motion} from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MealPrepPage = ({groceryList}) => {
    const [pantryItems, setPantryItems] = useState([]);
    const [inputItem, setInputItem] = useState('');
    const [selectedPreferences, setSelectedPreferences] = useState([]);
    const [mealPrepSuggestion, setMealPrepSuggestion] = useState('');
    const [mealPrepVideos, setMealPrepVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAllVideos, setShowAllVideos] = useState(false);

    const preferenceCategories = [
        {
            title: "Dietary Preferences",
            examples: ["Vegetarian", "Vegan", "Paleo", "Keto"],
            note: "Based on choice or lifestyle."
        },
        {
            title: "Dietary Restrictions",
            examples: ["Gluten-Free", "Lactose-Intolerant", "Nut-Free"],
            note: "Based on allergies, intolerances, medical conditions."
        },
        {
            title: "Macronutrient Focused Diets",
            examples: ["High-Carb", "Low-Carb", "High-Protein"],
            note: "Based on nutrient ratios (not ingredient exclusions)."
        },
        {
            title: "Ingredient Inclusion/Exclusion",
            examples: ["Dairy-Free", "Sugar-Free", "No-Red-Meat"],
            note: "Focused on specific ingredient presence or absence."
        }
    ];

    const handleAddItem = () => {
        if (inputItem.trim() !== '') {
            setPantryItems(prev => [...prev, inputItem.trim()]);
            setInputItem('');
        }
    };

    const handleDeleteItem = (index) => {
        setPantryItems(prev => prev.filter((_, idx) => idx !== index));
    };

    const handlePreferenceToggle = (option) => {
        setSelectedPreferences(prev =>
            prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
    };

    const handleSuggestMealPrep = async () => {
        if ((pantryItems.length + groceryList.length) === 0) return;

        setLoading(true);
        setError(null);
        setMealPrepSuggestion('');
        setMealPrepVideos([]);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:10000';
            const response = await fetch(`${apiUrl}/api/meal-prep-suggestion`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    preferences: selectedPreferences,
                    ingredients: [...pantryItems, ...groceryList]
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setMealPrepSuggestion(data.suggestion);
                setMealPrepVideos(data.videos || []);
            } else {
                setError(data.error || 'Failed to generate meal prep.');
            }
        } catch (error) {
            console.error('Error generating meal prep:', error);
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        const content = document.getElementById('meal-prep-content');
        if (!content) return;

        // TEMPORARILY hide videos
        const videosSection = document.getElementById('video-guides-section');
        if (videosSection) {
            videosSection.style.display = 'none';
        }

        const canvas = await html2canvas(content, {scale: 2});
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save('meal-prep.pdf');

        // RESTORE videos
        if (videosSection) {
            videosSection.style.display = '';
        }
    };


    return (
        <Box sx={{maxWidth: 800, mx: 'auto', p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
            <Paper elevation={3} sx={{p: 4, mb: 4, borderRadius: 2, backgroundColor: 'white'}}>
                <Typography variant="h4" gutterBottom sx={{color: '#2c3e50', fontWeight: 'bold', mb: 3}}>
                    Meal Prep from Your Pantry
                </Typography>

                <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                    <TextField
                        fullWidth
                        label="Add Pantry Item"
                        value={inputItem}
                        onChange={(e) => setInputItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <Button variant="contained" onClick={handleAddItem}>
                        <AddIcon/>
                    </Button>
                </Box>

                <List>
                    {pantryItems.map((item, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleDeleteItem(index)}>
                                    <DeleteIcon/>
                                </IconButton>
                            }
                        >
                            {item}
                        </ListItem>
                    ))}
                </List>

                <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
                    {preferenceCategories.map((category, idx) => (
                        <Box key={idx} sx={{mb: 3}}>
                            <Typography variant="subtitle1"
                                        sx={{fontWeight: 'bold', color: '#34495e'}}>{category.title}</Typography>
                            <Typography variant="caption"
                                        sx={{display: 'block', mb: 1, color: 'gray'}}>{category.note}</Typography>
                            <Grid container spacing={1}>
                                {category.examples.map((option) => (
                                    <Grid item key={option}>
                                        <Button
                                            variant={selectedPreferences.includes(option) ? "contained" : "outlined"}
                                            onClick={() => handlePreferenceToggle(option)}
                                            sx={{
                                                backgroundColor: selectedPreferences.includes(option) ? '#3498db' : 'white',
                                                color: selectedPreferences.includes(option) ? 'white' : '#3498db',
                                                borderColor: '#3498db',
                                                textTransform: 'none'
                                            }}
                                        >
                                            {option}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </motion.div>

                <Box sx={{textAlign: 'center', mt: 2}}>
                    <Button
                        variant="contained"
                        onClick={handleSuggestMealPrep}
                        disabled={loading || (pantryItems.length + groceryList.length) === 0}
                        sx={{backgroundColor: '#2980b9'}}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={20} sx={{color: 'white', mr: 1}}/>
                                Generating...
                            </>
                        ) : (
                            'Suggest Meal Prep'
                        )}
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
            </Paper>

            {mealPrepSuggestion && (
                <Paper id="meal-prep-content" elevation={2} sx={{p: 3, borderRadius: 2, backgroundColor: 'white'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#2c3e50'}}>Personalized Meal Prep
                            Suggestion</Typography>
                        <Button variant="outlined" onClick={handleExportPDF}>Download as PDF</Button>
                    </Box>

                    {mealPrepSuggestion.split(/Day \d:/).filter(Boolean).slice(0, 5).map((block, i) => {
                        const lines = block.trim().split('\n').filter(line => line.trim() !== '' && line.includes(':'));
                        return (
                            <motion.div key={i} initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.5, delay: i * 0.2}}>
                                <Paper elevation={1} sx={{p: 2, mb: 2, backgroundColor: 'white', borderRadius: 2}}>
                                    <Typography variant="subtitle1" sx={{fontWeight: 'bold', color: '#2980b9', mb: 1}}>
                                        <RestaurantIcon sx={{mr: 1, verticalAlign: 'middle'}}/> Day {i + 1}
                                    </Typography>
                                    {lines.map((line, idx) => {
                                        const [meal, description] = line.includes(':') ? line.split(':') : [line, ''];
                                        const icon = meal.toLowerCase().includes('breakfast') ?
                                            <FreeBreakfastIcon sx={{mt: '2px', mr: 1}}/> :
                                            meal.toLowerCase().includes('lunch') ?
                                                <LunchDiningIcon sx={{mt: '2px', mr: 1}}/> :
                                                <DinnerDiningIcon sx={{mt: '2px', mr: 1}}/>;
                                        return (
                                            <Box key={idx} sx={{display: 'flex', alignItems: 'flex-start', mb: 1}}>
                                                {icon}
                                                <Typography sx={{lineHeight: 1.6}}>
                                                    <strong>{meal?.trim()}:</strong> {description?.trim()}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Paper>
                            </motion.div>
                        );
                    })}
                    <Box id="video-guides-section">

                        {/* Video Thumbnails Section */}
                        {mealPrepVideos.length > 0 && (
                            <>
                                <Typography variant="h5" sx={{
                                    fontWeight: 'bold',
                                    color: '#1c6692',
                                    mt: 4,
                                    mb: 2,
                                    textAlign: 'center',
                                    borderBottom: '2px solid #1c6692',
                                    pb: 1
                                }}>
                                    Video Guides for Your Meals
                                </Typography>
                                <Grid container spacing={2}>
                                    {(showAllVideos ? mealPrepVideos : mealPrepVideos.slice(0, 4)).map((item, idx) => {
                                        const videoIdMatch = item.video.url.match(/v=([^&]+)/);
                                        const videoId = videoIdMatch ? videoIdMatch[1] : null;
                                        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;
                                        return (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                                            transition={{duration: 0.2, delay: 0.0}}
                                                            whileHover={{scale: 1.05}}>
                                                    <a href={item.video.url} target="_blank" rel="noopener noreferrer"
                                                       style={{textDecoration: 'none', color: 'inherit'}}>
                                                        <Paper elevation={3}
                                                               sx={{p: 2, borderRadius: 2, textAlign: 'center'}}>
                                                            {thumbnailUrl && (
                                                                <img src={thumbnailUrl} alt={item.meal} style={{
                                                                    width: '100%',
                                                                    borderRadius: '12px',
                                                                    marginBottom: '8px'
                                                                }}/>
                                                            )}
                                                            <Typography variant="subtitle1"
                                                                        sx={{fontWeight: 'bold', color: '#2c3e50'}}>
                                                                {item.meal.length > 30 ? `${item.meal.substring(0, 27)}...` : item.meal}
                                                            </Typography>
                                                        </Paper>
                                                    </a>
                                                </motion.div>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                                {mealPrepVideos.length > 2 && (
                                    <Box sx={{textAlign: 'center', mt: 2}}>
                                        <Button variant="outlined" onClick={() => setShowAllVideos(prev => !prev)}>
                                            {showAllVideos ? 'View Less' : 'View More'}
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default MealPrepPage;