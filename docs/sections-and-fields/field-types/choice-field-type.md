---
layout: docs
title: Choice field type
description: Field type configuration for the choice field type.
---

# Choice field type

The choice field provides a set of items a selection can be made from. 

## Settings
___

### Multiple: True or false
Allow selection of multiple choices.

### Choices
Add choices. A text and a value. If you would render a list fo choices the option `value` would be value, and the text of the option would be `text`. Like so:

{% highlight html %}
<select>
    <option value="elementary">Elementary</option>
    <option value="middleSchool">Middle School</option>
    <option value="highSchool">High School</option>
    <option value="university">University</option>
</select>
{% endhighlight %}

## Example config
___

![Configuration](/assets/images/choice-field-type-config.png)

___

### Advanced

If you want to configure a Choice Field type manually, for your backend, this is an example:

`/config/{application}/{section}/field/educationLevel.yml`
{% highlight yml %}
field:
    name: Education level
    handle: educationLevel
    type: Choice
    form:
        all:
            label: Education level
            multiple: false
            required: true
            placeholder: choose_education_level
            choices:
                Elementary: elementary
                Middle School: middleSchool
                High School: highSchool
                University: university
    generator:
        entity:
            validator:
                NotBlank:
                    message: 'form_error_not_blank'
{% endhighlight %}
