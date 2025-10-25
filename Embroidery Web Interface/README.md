# DST File Merger Web Application

This application allows you to merge DST files by entering a word between 1 and 10 letters. Each letter corresponds to a DST file that will be merged in sequence.

## Setup Instructions

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Organize your DST files in the following folder structure:
   ```
   project_directory/
   ├── letters1/           # For 1-letter words
   │   ├── A1.dst
   │   ├── B1.dst
   │   └── ...
   │   └── Z1.dst
   ├── letters2/           # For 2-letter words
   │   ├── A2.dst
   │   ├── B2.dst
   │   └── ...
   │   └── Z2.dst
   ├── letters3/           # For 3-letter words
   │   ├── A3.dst
   │   ├── B3.dst
   │   └── ...
   │   └── Z3.dst
   ...
   └── letters10/          # For 10-letter words
       ├── A10.dst
       ├── B10.dst
       └── ...
       └── Z10.dst
   ```

   Each folder should contain 26 DST files with the folder number in their names (e.g., A1.dst through Z1.dst in letters1 folder).

3. Run the application:
   ```bash
   python app.py
   ```

4. Open your web browser and go to: http://localhost:5001

## Usage

1. Enter a word between 1 and 10 letters in the input field
2. Click "Merge & Download"
3. The application will:
   - Use the appropriate folder based on the word length
   - Example for "HELLO" (5 letters): letters5/H5.dst, letters5/E5.dst, letters5/L5.dst, letters5/L5.dst, letters5/O5.dst
   - Example for "HELLOS" (6 letters): letters6/H6.dst, letters6/E6.dst, letters6/L6.dst, letters6/L6.dst, letters6/O6.dst, letters6/S6.dst
   - Example for "A" (1 letter): letters1/A1.dst
   - Example for "HELLO WORLD" (10 letters): letters10/H10.dst, letters10/E10.dst, letters10/L10.dst, letters10/L10.dst, letters10/O10.dst, letters10/W10.dst, letters10/O10.dst, letters10/R10.dst, letters10/L10.dst, letters10/D10.dst
   - Merge them in sequence
   - Download the merged file as "[word]_merged.dst"

## File Structure

```
project_directory/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── static/
│   └── style.css      # CSS styles
├── templates/
│   └── index.html     # Web interface
├── letters1/          # 1-letter DST files (A1.dst through Z1.dst)
├── letters2/          # 2-letter DST files (A2.dst through Z2.dst)
├── letters3/          # 3-letter DST files (A3.dst through Z3.dst)
...
└── letters10/         # 10-letter DST files (A10.dst through Z10.dst)
``` 