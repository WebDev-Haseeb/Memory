# Memory Card Game

![Memory Card Game](https://img.shields.io/badge/Memory-Card%20Game-6c5ce7)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

A beautiful, responsive memory card matching game with multiple difficulty levels, animations, and sound effects. Test your memory and concentration by finding matching pairs of cards as quickly as possible!

![Game Preview](https://via.placeholder.com/800x400?text=Memory+Game+Preview)

## 🌟 Features

- **Multiple Difficulty Levels**: Choose between Easy (4×3), Medium (6×3), and Hard (6×4) grid sizes
- **Record Tracking**: Your best times for each difficulty are saved
- **Responsive Design**: Play seamlessly on desktop, tablet, or mobile devices
- **Beautiful Animations**: Smooth card flips and visual feedback for matches
- **Sound Effects**: Optional sound effects enhance the gaming experience
- **Keyboard Controls**: Shortcuts for faster gameplay (ESC, R, M keys)
- **Modern UI**: Clean, modern, and visually appealing interface

## 🎮 How to Play

1. Choose a difficulty level (Easy, Medium, or Hard)
2. Click on cards to flip them over
3. Try to find matching pairs of cards
4. Match all pairs in the shortest time possible to set a new record
5. Your best times will be saved for each difficulty level

## 🚀 Getting Started

### Play Online

Visit [https://your-username.github.io/memory-game](https://your-username.github.io/memory-game) to play the game online.

### Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/memory-game.git
   ```

2. Navigate to the project directory:
   ```bash
   cd memory-game
   ```

3. Open `index.html` in your browser:
   ```bash
   # On macOS
   open index.html
   
   # On Windows
   start index.html
   
   # On Linux
   xdg-open index.html
   ```

## 🎯 Game Controls

- **Mouse/Touch**: Click or tap cards to flip them
- **ESC Key**: Return to menu
- **R Key**: Restart current game
- **M Key**: Toggle sound on/off

## 💻 Technologies Used

- **HTML5**: Structured semantic markup
- **CSS3**: Modern styling with Flexbox, Grid, and animations
- **JavaScript**: ES6+ features for game logic
- **LocalStorage API**: Persistent storage for game records
- **Font Awesome**: Icons for cards and UI elements

## 🧠 Game Logic

The game follows these core mechanics:

1. Cards are randomly placed on the board at the start of each game
2. A timer starts when the first card is flipped
3. Two cards can be flipped at a time
4. If the two cards match, they remain face up
5. If they don't match, they flip back face down
6. The game is won when all pairs are matched
7. Time and move count are tracked for scoring

## 🎨 Design Decisions

- **Color Scheme**: Uses a modern purple and pink gradient theme
- **Card Design**: Clean and minimalist with recognizable icons
- **Animations**: Subtle but effective transitions for improved UX
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Contrast ratios and keyboard navigation considered

## 📱 Responsive Behavior

The game is fully responsive and adapts to different screen sizes:

- **Desktop**: Full grid display with optimal card sizes
- **Tablet**: Adjusted grid layout and card sizes
- **Mobile**: Further optimizations for smaller screens
- **Landscape/Portrait**: Automatically adjusts based on orientation

## 🔧 Customization

You can easily customize the game by modifying:

- **Card Icons**: Edit the `cardIcons` array in `script.js`
- **Colors**: Change the CSS variables in `styles.css`
- **Difficulty Levels**: Adjust the `difficultiesConfig` object in `script.js`
- **Sound Effects**: Replace the audio files with your own

## 🔍 SEO Optimization

This project has been optimized for search engines with:

- Semantic HTML structure
- Proper meta tags
- Descriptive README file
- Meaningful commit messages
- Relevant tags and topics on GitHub

## 📈 Future Enhancements

- Additional themes and card designs
- Multiplayer mode
- Advanced statistics tracking
- Difficulty progression system
- Custom card uploading

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgements

- Icons provided by [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Sound effects from [Mixkit](https://mixkit.co/free-sound-effects/)

---

Made with ❤️ by [Your Name]

![Visitors](https://visitor-badge.glitch.me/badge?page_id=your-username.memory-game) 