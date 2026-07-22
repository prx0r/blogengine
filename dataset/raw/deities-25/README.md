---
license: apache-2.0
task_categories:
- image-classification
language:
- en
tags:
- art
- heritage
- culture
- iconography
pretty_name: Deities
size_categories:
- 1K<n<10K
---
# Deities-25
The dataset comprises of a comprehensive collection of 8,239 images showcasing diverse forms and iconographies of 25 Indic deities. This dataset is a unique blend of manually curated and web-scraped visuals, providing a valuable resource for the computer vision community interested in exploring the artistic and cultural expressions embedded in the visual representation of deities.


# Supported Tasks

- `image-classification`: The goal of this task is to classify a given image of a deity into one of 25 classes.

## Uses

### Direct Use

- *Cultural Awareness*: Raise awareness about the rich cultural heritage of the Indian subcontinent by incorporating these diverse depictions of Indic deities into educational materials.
- *Research and Preservation*: Contribute to academic research in the fields of art history, cultural studies, and anthropology. The dataset serves as a valuable resource for preserving and studying the visual representations of revered figures.
- *Deep learning research*: Offers exciting opportunities for multi-label classification tasks. However, a challenge in this domain is dealing with inter-class similarity, where images from different categories share common features.


### Source Data

Social media posts, smartphone camera captures, images generated using diffusion methods. 

#### Data Collection and Processing

We carefully selected diverse images for the dataset and used the `cleanvision` library from cleanlab to remove images with issues. A custom Python script helped organize the data effectively. When it came to training our model, we relied on torchvision transforms to prepare our dataset for training.

## Dataset Structure
```json
DatasetDict({
    train: Dataset({
        features: ['image', 'label'],
        num_rows: 6583
    })
    validation: Dataset({
        features: ['image', 'label'],
        num_rows: 1656
    })
})
```

### Dataset Splits

This dataset is split into a train and validation split. The split sizes are as follow:

| Split name   | Num samples         |
| ------------ | ------------------- |
| train        | 6583 |
| valid        | 1656 |

## Bias, Risks, and Limitations

- *Bias* - The dataset primarily represents Indic deities, potentially introducing a cultural bias. Efforts were made to include diverse forms, but the dataset may not fully encapsulate the breadth of artistic expressions across different Indic cultures.
- *Risks* - Images of deities can be open to various interpretations. The dataset may not capture nuanced meanings, leading to potential misinterpretations by users.